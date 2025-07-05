# PrismFlow v1.3.5 Release Notes

**Release Date:** July 5, 2025  
**Type:** Patch Release  
**Focus:** Enhanced Discord Webhook Error Handling

---

## 🛠️ Enhanced Discord Webhook Debugging

**Major Enhancement**: Significantly improved Discord webhook error handling and debugging capabilities to help identify and resolve webhook connectivity issues.

### What This Fixes For You

- **🔍 Better Error Messages**: More specific error messages that tell you exactly what's wrong
- **🧪 Debug Tools**: New testing command specifically for release webhook debugging
- **⚡ Improved Reliability**: Enhanced retry logic and validation for webhook requests
- **📊 Detailed Logging**: Comprehensive error logging to help troubleshoot issues

### New Debug Features

#### New Command: Test Release Webhook (Debug)

Access via Command Palette: `PrismFlow: Test Release Webhook (Debug)`

- **Exact Payload Testing**: Tests with the same payload structure as actual release notifications
- **Detailed Error Information**: Shows full error objects and Discord API responses
- **Enhanced Logging**: Logs all error details to help identify the root cause
- **Troubleshooting Guidance**: Provides specific advice based on the error type

#### Enhanced Error Detection

- **Discord API Error Codes**: Now detects specific error codes (10015, 50013, 10003, etc.)
- **HTTP Response Parsing**: Better extraction of error details from Discord API responses
- **Network Issue Detection**: Identifies timeouts, rate limits, and connection issues
- **Validation Errors**: Parses Discord validation errors with detailed field information

---

## 🔧 Technical Improvements

### Enhanced Error Handling

```typescript
// Before: Generic error messages
"Discord API error. Webhook URL may be invalid or expired"

// After: Specific error messages
"Discord API error for MyWebhook: Missing Permissions - The webhook lacks permission to send messages in this channel"
```

### Better Validation

- **URL Validation**: Validates webhook URLs before attempting to send
- **Retry Logic**: Now applied to release notifications for better reliability
- **Error Categorization**: Distinguishes between temporary and permanent errors
- **Response Analysis**: Parses Discord API response data for specific error details

### Improved Logging

- **Full Error Objects**: Logs complete error information for debugging
- **API Response Data**: Captures and logs Discord API response details
- **Stack Traces**: Includes error stack traces for development debugging
- **Structured Logging**: Organized error information for easier troubleshooting

---

## 🚨 Common Issues Now Detected

### Webhook Not Found (Error 10015)
- **Detection**: "UNKNOWN_WEBHOOK" or error code 10015
- **Message**: "Webhook not found or invalid. The webhook may have been deleted from Discord."
- **Solution**: Recreate the webhook in your Discord channel

### Missing Permissions (Error 50013)
- **Detection**: "MISSING_PERMISSIONS" or error code 50013
- **Message**: "Bot lacks permissions to send messages."
- **Solution**: Check webhook permissions in Discord channel settings

### Channel Not Found (Error 10003)
- **Detection**: "CHANNEL_NOT_FOUND" or error code 10003
- **Message**: "Channel not found. The channel may have been deleted."
- **Solution**: Ensure the Discord channel still exists

### Rate Limiting (Error 429)
- **Detection**: Rate limit errors or error code 429
- **Message**: "Rate limited by Discord. Please wait a few minutes before trying again."
- **Solution**: Wait and reduce notification frequency

### Network Issues
- **Detection**: Timeout, ECONNRESET, network errors
- **Message**: "Network timeout when sending. Please check your internet connection."
- **Solution**: Check network connectivity and try again

---

## 🧪 How to Debug Webhook Issues

### Step 1: Run the Debug Test
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `PrismFlow: Test Release Webhook (Debug)`
3. Check the detailed error message

### Step 2: Check VS Code Output
1. Go to `View > Output`
2. Select "PrismFlow" from the dropdown
3. Look for detailed error logs with full error objects

### Step 3: Try Regular Webhook Test
1. Run `PrismFlow: Test Discord Webhook` for comparison
2. See if the issue is specific to release notifications

### Step 4: Validate Your Webhook
1. Check that the Discord webhook URL is still valid
2. Verify the Discord channel still exists
3. Ensure the webhook has proper permissions

---

## 📋 What's Unchanged

- **✅ All Existing Features**: All Discord webhook functionality remains the same
- **✅ Backward Compatibility**: No breaking changes to existing configurations
- **✅ Performance**: No impact on normal webhook operation performance
- **✅ User Interface**: All commands and setup processes work exactly as before

---

## 🔗 Related Features

- **GitHub Webhooks**: Also workspace-specific (v1.3.4)
- **Git Monitoring**: Automatic release detection (v1.3.3)
- **Workspace Support**: Discord webhooks are workspace-specific (v1.3.2)

---

## 🚀 Getting Started with Debug Tools

### Test Your Webhooks

1. **Quick Test**: `PrismFlow: Test Discord Webhook`
2. **Connectivity Test**: `PrismFlow: Test Discord Connectivity`
3. **Release Debug**: `PrismFlow: Test Release Webhook (Debug)` ← **NEW!**

### Troubleshoot Issues

1. **Run Debug Test**: Use the new debug command for detailed error info
2. **Check Logs**: View VS Code Output panel for comprehensive error details
3. **Follow Guidance**: Use the specific troubleshooting advice in error messages

---

## 📞 Support

If you're still experiencing Discord webhook issues after using the enhanced debugging tools:

1. **Check the Debug Output**: The new tools should provide specific guidance
2. **Verify Discord Setup**: Ensure your webhook is properly configured in Discord
3. **Network Connectivity**: Check your internet connection and firewall settings
4. **Report Issues**: [GitHub Issues](https://github.com/Seristic/Prism-Flow/issues) with debug output

---

**Enhanced debugging for better webhook reliability! 🛠️**
