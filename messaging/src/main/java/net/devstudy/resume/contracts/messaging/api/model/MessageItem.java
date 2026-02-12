package net.devstudy.resume.contracts.messaging.api.model;

import java.time.Instant;
import java.util.List;

public record MessageItem(Long id, Long senderId, String body, Instant created,
        Instant edited, Instant deleted, List<AttachmentItem> attachments) {
}
