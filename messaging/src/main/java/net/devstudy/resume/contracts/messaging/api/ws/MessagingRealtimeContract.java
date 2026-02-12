package net.devstudy.resume.contracts.messaging.api.ws;

public final class MessagingRealtimeContract {

    public static final String STOMP_ENDPOINT = "/ws";
    public static final String TOPIC_CONVERSATION_MESSAGES_TEMPLATE = "/topic/conversations/%d/messages";
    public static final String TOPIC_CONVERSATION_READ_TEMPLATE = "/topic/conversations/%d/read";

    private MessagingRealtimeContract() {
    }

    public static String conversationMessagesTopic(long conversationId) {
        return TOPIC_CONVERSATION_MESSAGES_TEMPLATE.formatted(conversationId);
    }

    public static String conversationReadTopic(long conversationId) {
        return TOPIC_CONVERSATION_READ_TEMPLATE.formatted(conversationId);
    }
}
