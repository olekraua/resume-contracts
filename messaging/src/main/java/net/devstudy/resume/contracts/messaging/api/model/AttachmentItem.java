package net.devstudy.resume.contracts.messaging.api.model;

public record AttachmentItem(Long id, String originalName, String contentType, long size) {
}
