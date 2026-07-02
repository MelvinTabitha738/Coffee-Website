from django.contrib import admin
from django.utils.html import format_html
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    search_fields = ("name", "email", "phone", "message")
    readonly_fields = ("name", "email", "phone", "message", "created_at")
    ordering = ("-created_at",)
    list_filter = ("is_read", "created_at")
    list_per_page = 20
    actions = ["mark_as_read", "mark_as_unread"]

    # ─── Short preview of the message ────────────────────────────────────────
    def short_message(self, obj):
        return obj.message[:65] + "..." if len(obj.message) > 65 else obj.message
    short_message.short_description = "Message Preview"

    # ─── Color badge for read/unread status ──────────────────────────────────
    def colored_status(self, obj):
        if not obj.is_read:
            return format_html(
                '<span style="background:#ef4444;color:white;padding:3px 12px;'
                'border-radius:12px;font-size:11px;font-weight:700;">● NEW</span>'
            )
        return format_html(
            '<span style="background:#22c55e;color:white;padding:3px 12px;'
            'border-radius:12px;font-size:11px;font-weight:600;">✓ READ</span>'
        )
    colored_status.short_description = "Status"
    colored_status.allow_tags = True

    list_display = ("name", "email", "phone", "short_message", "colored_status", "created_at")

    # ─── Mark selected messages as read ──────────────────────────────────────
    def mark_as_read(self, request, queryset):
        count = queryset.update(is_read=True)
        self.message_user(request, f"✅ {count} message(s) marked as read.")
    mark_as_read.short_description = "✅ Mark selected as Read"

    # ─── Mark selected messages as unread ────────────────────────────────────
    def mark_as_unread(self, request, queryset):
        count = queryset.update(is_read=False)
        self.message_user(request, f"📬 {count} message(s) marked as unread.")
    mark_as_unread.short_description = "📬 Mark selected as Unread"

    # ─── Auto-mark as read when opened in detail view ────────────────────────
    def change_view(self, request, object_id, form_url="", extra_context=None):
        obj = self.get_object(request, object_id)
        if obj and not obj.is_read:
            obj.is_read = True
            obj.save()
        return super().change_view(request, object_id, form_url, extra_context)
