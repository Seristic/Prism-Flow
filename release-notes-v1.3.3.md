# PrismFlow v1.3.3 Release Notes

**Release Date:** July 5, 2025

## 🏷️ Fix Automatic Release Detection

This patch release fixes an important issue where automatic Discord notifications weren't being sent when Git release tags were created.

### 🔧 What Was Wrong

Previously, the GitWatcher was only monitoring for commit changes, which meant:

- ❌ Release tags created **after** commits weren't detected
- ❌ Commands like `git tag v1.3.3` followed by `git push --tags` didn't trigger notifications
- ❌ Discord release notifications only worked if the tag was created **with** the commit

### ✅ What's Fixed

Now the GitWatcher has enhanced tag detection:

- **Real-time Tag Detection**: Dedicated file system watcher for `refs/tags/**`
- **Immediate Notifications**: Discord notifications sent as soon as tags are created
- **Better Monitoring**: Separate tracking for tags vs commits
- **Enhanced Fallback**: Polling checks for both commits and tags every 30 seconds

### 🚀 How It Works Now

When you create a release tag:

```bash
git tag v1.3.3
git push origin v1.3.3
```

The extension will:

1. **Instantly detect** the new tag via file system watcher
2. **Check if it's a version tag** (matches `v1.2.3` pattern)
3. **Send Discord notification** if release webhooks are configured
4. **Show VS Code notification** confirming the Discord message was sent

### 📡 Technical Improvements

- **Dedicated Tag Watcher**: New `tagsWatcher` for `refs/tags/**` changes
- **Tag Tracking**: `lastKnownTags` array tracks known tags to detect new ones
- **Enhanced Polling**: Fallback timer checks both commits and tags
- **Better Logging**: Improved console logging for debugging tag detection
- **Proper Disposal**: All watchers are properly cleaned up

### 🎯 What This Means for You

- **Automatic Release Notifications**: Creating Git tags now automatically sends Discord notifications
- **No Manual Commands**: No need to use "Send Latest Release Webhook" manually
- **Real-time Updates**: Team gets notified immediately when releases are tagged
- **Better Workflow**: Seamless integration with standard Git release workflows

### 🔄 Backwards Compatibility

This release is fully backwards compatible:

- All existing features continue to work
- Workspace-specific webhooks from v1.3.2 remain unchanged
- Enhanced error handling from v1.3.1 still active
- Automatic Git detection from v1.3.0 enhanced, not replaced

### 🧪 Testing

To test the new functionality:

1. Set up Discord webhooks for "releases" events
2. Create a new tag: `git tag v1.0.0-test`
3. Push the tag: `git push origin v1.0.0-test`
4. You should see both a VS Code notification and Discord message

### 🐛 Bug Reports & Feedback

Please report any issues on our [GitHub repository](https://github.com/seristic/prism-flow/issues).

---

**Previous Updates**:

- **v1.3.2**: Workspace-specific Discord webhooks
- **v1.3.1**: Enhanced Discord error handling and retry logic
- **v1.3.0**: Automatic Git detection for external pushes
