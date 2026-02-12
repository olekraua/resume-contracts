package net.devstudy.resume.contracts.messaging.api.event;

public record ReadEvent(Long conversationId, Long profileId, Long lastReadMessageId) {
}
