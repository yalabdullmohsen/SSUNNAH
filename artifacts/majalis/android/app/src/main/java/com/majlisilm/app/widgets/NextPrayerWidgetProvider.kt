package com.majlisilm.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.majlisilm.app.MainActivity
import com.majlisilm.app.R

class NextPrayerWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (id in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, id)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_next_prayer)
            val snap = SunnahWidgetSnapshotStore.load(context)
            val prayer = snap?.optJSONObject("prayer")
            val next = prayer?.optJSONObject("next")
            val nextName = next?.optString("nameAr")?.ifBlank { "—" } ?: "—"
            val remain = prayer?.optString("remainingLabel")?.ifBlank { "حدّث من التطبيق" } ?: "حدّث من التطبيق"
            val city = prayer?.optString("city").orEmpty()

            views.setTextViewText(R.id.widget_next_label, "الصلاة القادمة")
            views.setTextViewText(R.id.widget_next_name, nextName)
            views.setTextViewText(R.id.widget_next_remain, remain)
            views.setTextViewText(R.id.widget_next_city, city)

            val intent = Intent(context, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = Uri.parse("https://www.ssunnah.com/prayer-times")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pending = PendingIntent.getActivity(
                context,
                appWidgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            views.setOnClickPendingIntent(R.id.widget_next_root, pending)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
