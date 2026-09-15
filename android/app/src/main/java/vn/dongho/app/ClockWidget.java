package vn.dongho.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.content.ComponentName;
import java.util.Calendar;
import android.content.Intent;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import org.json.JSONObject;

public class ClockWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
    
    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (Intent.ACTION_TIME_TICK.equals(intent.getAction()) || 
            Intent.ACTION_TIME_CHANGED.equals(intent.getAction()) || 
            Intent.ACTION_TIMEZONE_CHANGED.equals(intent.getAction()) ||
            AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(intent.getAction())) {
            
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, ClockWidget.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
        String base64Image = prefs.getString("widgetImageBase64", "");
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.clock_widget);
        
        if (!base64Image.isEmpty()) {
            try {
                byte[] decodedString = Base64.decode(base64Image, Base64.DEFAULT);
                Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                views.setImageViewBitmap(R.id.widget_canvas, decodedByte);
            } catch (Exception e) {
                e.printStackTrace();
                drawFallbackClock(context, views, prefs);
            }
        } else {
            drawFallbackClock(context, views, prefs);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
        scheduleNextUpdate(context);
    }
    
    private static void drawFallbackClock(Context context, RemoteViews views, SharedPreferences prefs) {
        String jsonStr = prefs.getString("widgetConfig", "{}");
        String suffix = "";
        
        int canvasW = 1200;
        int canvasH = 500;
        Bitmap bitmap = Bitmap.createBitmap(canvasW, canvasH, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        try {
            JSONObject config = new JSONObject(jsonStr);
            suffix = config.optString("suffix", "");
            boolean hideColons = config.optBoolean("hideColons", false);
            boolean advancedSize = config.optBoolean("advancedSize", false);
            int globalSize = config.optInt("globalSize", 80);
            
            JSONObject sizes = config.optJSONObject("sizes");
            if (sizes == null) sizes = new JSONObject();
            JSONObject positions = config.optJSONObject("positions");
            if (positions == null) positions = new JSONObject();
            
            int colonSpacing = config.optInt("colonSpacing", -12);
            
            // Baseline sizes
            float baseScale = globalSize / 80f;
            float h1Scale = baseScale * (advancedSize ? (sizes.optInt("h1", 80) / 80f) : 1f);
            float h2Scale = baseScale * (advancedSize ? (sizes.optInt("h2", 80) / 80f) : 1f);
            float m1Scale = baseScale * (advancedSize ? (sizes.optInt("m1", 80) / 80f) : 1f);
            float m2Scale = baseScale * (advancedSize ? (sizes.optInt("m2", 80) / 80f) : 1f);
            float colonScale = baseScale * (advancedSize ? (sizes.optInt("colon", 80) / 80f) : 1f);
            
            Calendar calendar = Calendar.getInstance();
            int hour = calendar.get(Calendar.HOUR_OF_DAY);
            int minute = calendar.get(Calendar.MINUTE);

            int h1 = hour / 10;
            int h2 = hour % 10;
            int m1 = minute / 10;
            int m2 = minute % 10;
            
            int digitW = 180;
            int colonW = 90;
            
            int totalW = digitW * 4 + colonW + colonSpacing * 2;
            int startX = (canvasW - totalW) / 2;
            int startY = 150;
            
            int curX = startX;
            
            drawDigit(context, canvas, "digit_" + h1 + suffix, curX, startY, h1Scale, positions.optJSONObject("h1"));
            curX += digitW;
            
            drawDigit(context, canvas, "digit_" + h2 + suffix, curX, startY, h2Scale, positions.optJSONObject("h2"));
            curX += digitW + colonSpacing * 3;
            
            if (!hideColons) {
                String colonName = "colon" + (suffix.isEmpty() ? "" : "_" + suffix);
                drawDigit(context, canvas, colonName, curX, startY, colonScale, positions.optJSONObject("colon"));
            }
            curX += colonW + colonSpacing * 3;
            
            drawDigit(context, canvas, "digit_" + m1 + suffix, curX, startY, m1Scale, positions.optJSONObject("m1"));
            curX += digitW;
            
            drawDigit(context, canvas, "digit_" + m2 + suffix, curX, startY, m2Scale, positions.optJSONObject("m2"));
            
        } catch (Exception e) {
            e.printStackTrace();
        }

        views.setImageViewBitmap(R.id.widget_canvas, bitmap);
    }
    
    private static void drawDigit(Context context, Canvas canvas, String name, int x, int y, float scale, JSONObject pos) {
        int id = getDrawableId(context, name);
        if (id == 0) return;
        
        Drawable d = context.getResources().getDrawable(id, null);
        if (d == null) return;
        
        int w = d.getIntrinsicWidth();
        int h = d.getIntrinsicHeight();
        
        float offsetX = 0, offsetY = 0;
        if (pos != null) {
            offsetX = (float) pos.optDouble("x", 0) * 3f;
            offsetY = (float) pos.optDouble("y", 0) * 3f;
        }
        
        int baseH = 200;
        int scaledH = (int)(baseH * scale);
        int scaledW = (int)(w * ((float)scaledH / h));
        
        int finalX = x + (int)offsetX;
        int finalY = y + (int)offsetY;
        
        // draw horizontally centered in its block, vertically from top
        int cx = finalX + (180 - scaledW) / 2;
        
        d.setBounds(cx, finalY, cx + scaledW, finalY + scaledH);
        d.draw(canvas);
    }

    private static void scheduleNextUpdate(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, ClockWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, ClockWidget.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.add(Calendar.MINUTE, 1);

        try {
            alarmManager.setExact(AlarmManager.RTC, calendar.getTimeInMillis(), pendingIntent);
        } catch (SecurityException e) {
            alarmManager.set(AlarmManager.RTC, calendar.getTimeInMillis(), pendingIntent);
        }
    }
    
    private static int getDrawableId(Context context, String name) {
        int id = context.getResources().getIdentifier(name, "drawable", context.getPackageName());
        if (id == 0) {
            String fallback;
            if (name.startsWith("colon")) fallback = "colon";
            else fallback = "digit_" + name.replaceAll("[^0-9]", "");
            id = context.getResources().getIdentifier(fallback, "drawable", context.getPackageName());
        }
        return id;
    }
}
