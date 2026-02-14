package net.devstudy.resume.contracts.file.api.event;

public final class FileEventContract {

    public static final String TOPIC_UPLOADED = "resume.file.uploaded";
    public static final String TOPIC_ANTIVIRUS_PASSED = "resume.file.antivirus.passed";
    public static final String TOPIC_ANTIVIRUS_FAILED = "resume.file.antivirus.failed";
    public static final String TOPIC_MODERATION_PASSED = "resume.file.moderation.passed";
    public static final String TOPIC_MODERATION_FAILED = "resume.file.moderation.failed";
    public static final String TOPIC_THUMBNAIL_READY = "resume.file.thumbnail.ready";
    public static final String TOPIC_THUMBNAIL_FAILED = "resume.file.thumbnail.failed";
    public static final String TOPIC_READY = "resume.file.ready";
    public static final String TOPIC_FAILED = "resume.file.failed";
    public static final String TOPIC_DELETED = "resume.file.deleted";

    public static final String FILE_UPLOADED_V1 = "file.uploaded.v1";
    public static final String FILE_ANTIVIRUS_PASSED_V1 = "file.antivirus.passed.v1";
    public static final String FILE_ANTIVIRUS_FAILED_V1 = "file.antivirus.failed.v1";
    public static final String FILE_MODERATION_PASSED_V1 = "file.moderation.passed.v1";
    public static final String FILE_MODERATION_FAILED_V1 = "file.moderation.failed.v1";
    public static final String FILE_THUMBNAIL_READY_V1 = "file.thumbnail.ready.v1";
    public static final String FILE_THUMBNAIL_FAILED_V1 = "file.thumbnail.failed.v1";
    public static final String FILE_READY_V1 = "file.ready.v1";
    public static final String FILE_FAILED_V1 = "file.failed.v1";
    public static final String FILE_DELETED_V1 = "file.deleted.v1";

    private FileEventContract() {
    }
}
