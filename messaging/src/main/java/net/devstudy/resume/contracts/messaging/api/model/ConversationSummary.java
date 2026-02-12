package net.devstudy.resume.contracts.messaging.api.model;

import java.time.Instant;

public record ConversationSummary(Long conversationId, Long otherProfileId,
        MessageItem lastMessage, long unreadCount) {

    public Instant lastMessageAt() {
        return lastMessage == null ? null : lastMessage.created();
    }
}
