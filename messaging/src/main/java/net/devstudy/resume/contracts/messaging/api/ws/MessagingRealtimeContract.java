package net.devstudy.resume.contracts.messaging.api.ws;

public final class MessagingRealtimeContract {

    public static final String RT_ENDPOINT = "/rt";
    public static final String RT_PROTOCOL = "rt-v1";
    public static final int RT_PROTOCOL_VERSION = 1;
    public static final String CONVERSATION_MESSAGES_DESTINATION_TEMPLATE = "/user/queue/conversations/%d/messages";
    public static final String CONVERSATION_READ_DESTINATION_TEMPLATE = "/user/queue/conversations/%d/read";

    @Deprecated
    public static final String STOMP_ENDPOINT = RT_ENDPOINT;
    @Deprecated
    public static final String USER_QUEUE_CONVERSATION_MESSAGES_TEMPLATE = CONVERSATION_MESSAGES_DESTINATION_TEMPLATE;
    @Deprecated
    public static final String USER_QUEUE_CONVERSATION_READ_TEMPLATE = CONVERSATION_READ_DESTINATION_TEMPLATE;
    @Deprecated
    public static final String USER_DESTINATION_CONVERSATION_MESSAGES_TEMPLATE = "/queue/conversations/%d/messages";
    @Deprecated
    public static final String USER_DESTINATION_CONVERSATION_READ_TEMPLATE = "/queue/conversations/%d/read";

    private MessagingRealtimeContract() {
    }

    public static String conversationMessagesDestination(long conversationId) {
        return CONVERSATION_MESSAGES_DESTINATION_TEMPLATE.formatted(conversationId);
    }

    public static String conversationReadDestination(long conversationId) {
        return CONVERSATION_READ_DESTINATION_TEMPLATE.formatted(conversationId);
    }

    @Deprecated
    public static String conversationMessagesTopic(long conversationId) {
        return conversationMessagesDestination(conversationId);
    }

    @Deprecated
    public static String conversationReadTopic(long conversationId) {
        return conversationReadDestination(conversationId);
    }

    public static String conversationMessagesUserDestination(long conversationId) {
        return USER_DESTINATION_CONVERSATION_MESSAGES_TEMPLATE.formatted(conversationId);
    }

    public static String conversationReadUserDestination(long conversationId) {
        return USER_DESTINATION_CONVERSATION_READ_TEMPLATE.formatted(conversationId);
    }
}
