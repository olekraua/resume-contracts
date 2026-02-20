package net.devstudy.resume.contracts.messaging.api.ws;

public final class MessagingRealtimeContract {

    public static final String RT_ENDPOINT = "/rt";
    public static final String RT_PROTOCOL = "rt-v2";
    public static final int RT_PROTOCOL_VERSION = 2;
    public static final String RT_PAYLOAD_CODEC = "protobuf-value-v1";
    public static final String CONVERSATION_MESSAGES_DESTINATION_TEMPLATE = "/user/queue/conversations/%d/messages";
    public static final String CONVERSATION_READ_DESTINATION_TEMPLATE = "/user/queue/conversations/%d/read";

    private MessagingRealtimeContract() {
    }

    public static String conversationMessagesDestination(long conversationId) {
        return CONVERSATION_MESSAGES_DESTINATION_TEMPLATE.formatted(conversationId);
    }

    public static String conversationReadDestination(long conversationId) {
        return CONVERSATION_READ_DESTINATION_TEMPLATE.formatted(conversationId);
    }

}
