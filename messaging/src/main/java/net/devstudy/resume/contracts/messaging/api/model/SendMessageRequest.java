package net.devstudy.resume.contracts.messaging.api.model;

import java.util.List;

public record SendMessageRequest(String body, List<Long> attachmentIds) {
}
