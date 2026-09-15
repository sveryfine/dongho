package vn.dongho.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.content.SharedPreferences;
import android.content.Context;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        registerPlugin(ScreenPinningPlugin.class);
        hideSystemUI();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    @Override
    public void onBackPressed() {
        // Vô hiệu hóa nút Back
    }

    @Override
    public void onResume() {
        super.onResume();
        try {
            startLockTask();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        try {
            WebView webView = this.bridge.getWebView();
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void saveWidgetSettings(String jsonConfig) {
                    SharedPreferences prefs = getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
                    prefs.edit().putString("widgetConfig", jsonConfig).apply();
                    
                    try {
                        Intent intent = new Intent(MainActivity.this, ClockWidget.class);
                        intent.setAction(android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        int[] ids = android.appwidget.AppWidgetManager.getInstance(getApplication()).getAppWidgetIds(new android.content.ComponentName(getApplication(), ClockWidget.class));
                        intent.putExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
                        sendBroadcast(intent);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                @JavascriptInterface
                public void saveWidgetImage(String base64Image) {
                    SharedPreferences prefs = getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE);
                    prefs.edit().putString("widgetImageBase64", base64Image).apply();
                    
                    try {
                        Intent intent = new Intent(MainActivity.this, ClockWidget.class);
                        intent.setAction(android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                        int[] ids = android.appwidget.AppWidgetManager.getInstance(getApplication()).getAppWidgetIds(new android.content.ComponentName(getApplication(), ClockWidget.class));
                        intent.putExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
                        sendBroadcast(intent);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }, "AndroidWidgetBridge");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams layoutParams = getWindow().getAttributes();
            layoutParams.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(layoutParams);
        }
    }
}
