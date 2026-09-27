package com.majlisilm.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.majlisilm.app.widgets.NextPrayerWidgetProvider
import com.majlisilm.app.widgets.SunnahWidgetSnapshotStore

@CapacitorPlugin(name = "SunnahWidgets")
class SunnahWidgetsPlugin : Plugin() {
    @PluginMethod
    fun isSupported(call: PluginCall) {
        val ret = JSObject()
        ret.put("supported", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun writeSnapshot(call: PluginCall) {
        val json = call.getString("json")
        val ret = JSObject()
        if (json.isNullOrBlank()) {
            ret.put("ok", false)
            ret.put("reason", "invalid_json")
            call.resolve(ret)
            return
        }
        val ok = SunnahWidgetSnapshotStore.save(context, json)
        ret.put("ok", ok)
        call.resolve(ret)
    }

    @PluginMethod
    fun reloadAll(call: PluginCall) {
        val mgr = AppWidgetManager.getInstance(context)
        val ids = mgr.getAppWidgetIds(ComponentName(context, NextPrayerWidgetProvider::class.java))
        if (ids.isNotEmpty()) {
            val intent = Intent(context, NextPrayerWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
            context.sendBroadcast(intent)
        }
        val ret = JSObject()
        ret.put("ok", true)
        call.resolve(ret)
    }
}
