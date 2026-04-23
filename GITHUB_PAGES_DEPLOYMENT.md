# 📘 GitHub Pages Deployment Guide for Ezoic

Since you're using **GitHub Pages** (not Vercel), here are the specific instructions for your setup.

---

## ⚠️ Important: ads.txt for GitHub Pages

GitHub Pages doesn't support server-side redirects, so you need to **manually manage** your ads.txt file.

### **Step 1: Update ads.txt Manually**

1. Visit: **https://srv.adstxtmanager.com/19390/koyjabo.com**
2. Copy **ALL** the content from that page
3. Open `public/ads.txt` in your project
4. Paste the Ezoic content at the bottom (keep your existing AdSense entry)
5. Save the file

### **Step 2: Update Monthly**

Ezoic's ads.txt content changes as they add new ad partners. Update it monthly:
- Visit the same URL
- Copy fresh content
- Update `public/ads.txt`
- Commit and push

---

## 🚀 Deployment Process

### **For GitHub Pages:**

```bash
# 1. Build your project
npm run build

# 2. The build goes to 'dist' folder
# Make sure your GitHub Pages is configured to serve from the correct folder

# 3. Commit all changes
git add .
git commit -m "Your commit message"

# 4. Push to GitHub
git push origin main

# 5. GitHub Pages will automatically deploy
```

### **GitHub Pages Settings:**

1. Go to your repo: `https://github.com/mejbaurbahar/Dhaka-Commute`
2. Settings → Pages
3. Ensure it's set to deploy from the correct branch and folder
4. Your site should be at: `https://koyjabo.com` or `https://mejbaurbahar.github.io/Dhaka-Commute/`

---

## 🔧 Authentication Issue Fix

The push is failing because of a credential mismatch. Here are solutions:

### **Option 1: Use GitHub Desktop (Easiest)**
1. Open GitHub Desktop
2. It will show your commit ready to push
3. Click "Push origin"
4. Done!

### **Option 2: Update Git Credentials**

```powershell
# Clear old credentials
git credential reject
# Then paste this and hit Enter twice:
protocol=https
host=github.com

# OR use credential manager
git config --global credential.helper manager-core

# Then try pushing
git push origin main
```

### **Option 3: Use Personal Access Token**

1. Go to GitHub: Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Give it 'repo' permissions
4. Copy the token
5. Push with:
```powershell
git push https://YOUR_TOKEN@github.com/mejbaurbahar/Dhaka-Commute.git main
```

### **Option 4: Switch to SSH** 

```powershell
# Change remote to SSH
git remote set-url origin git@github.com:mejbaurbahar/Dhaka-Commute.git

# Push
git push origin main
```

---

## 📁 Files You Can Ignore

Since you're using GitHub Pages (not Vercel), you can ignore:

- ✅ `vercel.json` removed (Not using Vercel)
- ❌ `.htaccess` - Not used by GitHub Pages (uses Nginx)

These files won't cause issues; they'll just be ignored by GitHub Pages.

---

## ✅ Deployment Checklist

### Before Deploying:
- [x] ✅ Ezoic scripts added to HTML files (DONE)
- [x] ✅ Code committed locally (DONE)
- [ ] ⏳ **Update `public/ads.txt` with Ezoic content** (YOUR ACTION REQUIRED)
- [ ] ⏳ Authenticate and push to GitHub
- [ ] ⏳ Verify GitHub Pages deployment
- [ ] ⏳ Test `https://koyjabo.com/ads.txt`

### After Deploying:
- [ ] ⏳ Create placements in Ezoic Dashboard
- [ ] ⏳ Add `<EzoicAd>` components to your pages
- [ ] ⏳ Wait 24-48 hours for Ezoic approval
- [ ] ⏳ Monitor Ezoic Dashboard

---

## 🎯 Quick Actions

### **1. Update ads.txt NOW:**
```bash
# Visit this URL in your browser:
https://srv.adstxtmanager.com/19390/koyjabo.com

# Copy all content
# Paste into: public/ads.txt (at the bottom, keep AdSense entry)
```

### **2. Push to GitHub:**
```bash
# Use one of the authentication methods above
# Then:
git add public/ads.txt
git commit -m "Update ads.txt with Ezoic content"
git push origin main
```

### **3. Verify Deployment:**
```bash
# After GitHub Pages deploys (usually 1-2 minutes):
# Visit: https://koyjabo.com/ads.txt
# Should show both AdSense and Ezoic entries
```

---

## 📞 Need Help?

**Authentication Issues:**
- Try GitHub Desktop (easiest)
- Or use Personal Access Token (most reliable)

**ads.txt Issues:**
- Make sure file is in `public/` folder
- Must be accessible at `https://koyjabo.com/ads.txt`
- Update monthly

**Deployment Issues:**
- Check GitHub Pages settings in your repo
- Ensure building to correct folder
- Check GitHub Actions tab for build logs

---

**Next Step:** Update `public/ads.txt` with content from Ezoic's URL, then push to GitHub!

---

Last Updated: February 12, 2026  
For: koyjabo.com (GitHub Pages)
