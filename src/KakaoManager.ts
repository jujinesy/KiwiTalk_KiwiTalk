import {
  ChannelUserInfo,
  ChatFeeds,
  Chatlog, Long, TalkChannel, TalkClient,
} from 'node-kakao';

/* eslint-disable no-unused-vars */
export enum ChannelEventType {
  ADD,
  LEAVE,
}

export enum ChatEventType {
  ADD
}

/* eslint-enable no-unused-vars */

type ChannelEvent = (type: ChannelEventType, channel: TalkChannel) => void;
type ChatEvent = (type: ChatEventType, chat: Chatlog, channel: TalkChannel) => void;

export default class KakaoManager {
  static channelList: TalkChannel[] = [];
  static chatList = new Map<string, Chatlog[]>();
  static feedList = new Map<Chatlog, [ChatFeeds, ChannelUserInfo | undefined]>();

  static channelEvents = new Map<string, ChannelEvent>();
  static chatEvents = new Map<string, ChatEvent>();

  private static isInit = false;
  private static client: TalkClient;

  static async init(client: TalkClient): Promise<void> {
    if (this.isInit) return;

    this.client = client;

    this.channelList = Array.from(this.client.channelList.all());

    for (const channel of this.channelList) {
      await this.initChat(channel);
    }

    const handleFeedLog = (
        feedLog: Chatlog,
        channel: TalkChannel,
        feed: ChatFeeds,
        user?: ChannelUserInfo,
    ) => {
      const channelId = channel.channelId.toString();
      const chatList = this.chatList.get(channelId);

      chatList?.push(feedLog);
      this.feedList.set(feedLog, [feed, user]);

      this.chatEvents.forEach(
          (value) => value(ChatEventType.ADD, feedLog, this.getChannel(channelId)),
      );
    };

    this.client.on('channel_kicked', (kickedLog, channel, feed) => {
      handleFeedLog(kickedLog, channel, feed);
    });

    this.client.on('channel_link_deleted', (feedLog, channel, feed) => {
      handleFeedLog(feedLog, channel, feed);
    });

    this.client.on('message_hidden', (hideLog, channel, feed) => {
      handleFeedLog(hideLog, channel, feed);
    });

    this.client.on('user_left', (leftLog, channel, user, feed) => {
      handleFeedLog(leftLog, channel, feed, user);
    });

    this.client.on('user_join', (joinLog, channel, user, feed) => {
      handleFeedLog(joinLog, channel, feed, user);
    });

    this.client.on('chat_deleted', (feedChatlog, channel, feed) => {
      handleFeedLog(feedChatlog, channel, feed);
    });

    this.client.on('chat_event', (channel, author, type, count, chat) => {
      const channelId = channel.channelId.toString();
      const chatList = this.chatList.get(channelId);

      if (
        channel.info.lastChatLog &&
        chat.logId === channel.info.lastChatLogId
      ) {
        chatList?.push(channel.info.lastChatLog);

        this.chatEvents.forEach(
            (value) => {
              if (channel.info.lastChatLog) {
                value(ChatEventType.ADD, channel.info.lastChatLog, this.getChannel(channelId));
              }
            },
        );
      }
    });

    this.client.on('channel_join', (channel) => {
      this.channelList.push(channel);

      this.initChat(channel);

      this.channelEvents.forEach(
          (value) => value(ChannelEventType.ADD, channel),
      );
    });

    this.client.on('channel_left', (channel) => {
      this.channelList = this.channelList.filter((value) => value !== channel);
      this.chatList.set(channel.channelId.toString(), []);

      this.channelEvents.forEach(
          (value) => value(ChannelEventType.LEAVE, channel),
      );
    });

    this.isInit = true;
  }

  static async initChat(channel: TalkChannel): Promise<void> {
    if (!channel.info.lastChatLog) return;
    let startId = channel.info.lastChatLogId;
    const update: Chatlog[] = [];
    let chatLog: Chatlog[];

    const getChatLog = async (startId: Long): Promise<Chatlog[]> => {
      const chatListFromRes = await channel.getChatListFrom(startId);
      if (chatListFromRes.success) {
        return chatListFromRes.result;
      } else {
        return [];
      }
    };

    while (
      (
        chatLog = await getChatLog(startId)
      ) && chatLog.length > 0) {
      update.push(...chatLog);
      if (startId.notEquals(chatLog[chatLog.length - 1].logId)) {
        startId = chatLog[chatLog.length - 1].logId;
      }
    }

    this.chatList.set(channel.channelId.toString(), update);
  }

  static getChannel(id: string): TalkChannel {
    const channel = this.channelList.find(({ channelId }) => channelId.equals(id));
    if (!channel) throw Error(`${id} is not found`);

    return channel;
  }
}
