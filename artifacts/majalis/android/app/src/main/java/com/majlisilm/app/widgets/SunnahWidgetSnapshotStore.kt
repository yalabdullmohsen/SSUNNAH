package com.majlisilm.app.widgets

import android.content.Context
import org.json.JSONObject

object SunnahWidgetSnapshotStore {
    const val PREFS = "sunnah_widgets"
    const val KEY = "snapshot_v1"

    fun save(context: Context, json: String): Boolean {
        return try {
            JSONObject(json) // validate
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY, json)
                .apply()
            true
        } catch (_: Exception) {
            false
        }
    }

    fun load(context: Context): JSONObject? {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null)
            ?: return null
        return try {
            JSONObject(raw)
        } catch (_: Exception) {
            null
        }
    }
}
