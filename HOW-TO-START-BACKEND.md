# ✅ How to Start the Backend Server - Simple Steps

## 🎯 What You Need to Do

**"Backend running on http://localhost:4000"** is just a **message** that appears when the server starts. You need to run the **command** that starts it.

---

## 📝 Step-by-Step Instructions

### Step 1: Open Terminal
- Open PowerShell or Command Prompt
- OR in VS Code: Press `Ctrl + ~` (tilde key)

### Step 2: Navigate to Backend Folder
Copy and paste this command:

```powershell
cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
```

Press **Enter**

### Step 3: Start the Server
Copy and paste this command:

```powershell
npm run dev
```

Press **Enter**

### Step 4: Wait for the Message
You should see:
```
[nodemon] starting 'node src/index.js'
Backend running on http://localhost:4000
```

**When you see this, the backend is running!** ✅

### Step 5: Keep Terminal Open
**DO NOT CLOSE the terminal!** The server must stay running.

---

## 🎯 Quick Copy-Paste Commands

Open PowerShell and run these **one at a time**:

**Command 1:**
```powershell
cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
```

**Command 2:**
```powershell
npm run dev
```

That's it! The backend will start and you'll see the message.

---

## ✅ After Backend Starts

1. **Keep the terminal window open** (server is running)
2. **Go to your browser**
3. **Refresh the page** (F5)
4. **Try checkout again** - it should work! 🎉

---

## 🆘 Common Issues

### "npm is not recognized"
- Node.js is not installed
- Install Node.js from nodejs.org

### "Cannot find module"
- Run: `npm install` first, then `npm run dev`

### Port 4000 already in use
- Another process is using port 4000
- Close other terminals or kill the process

---

## 📋 Remember

- ✅ Run the **command** (`npm run dev`)
- ❌ Don't type the **message** ("Backend running...")
- ✅ Keep the terminal **open**
- ✅ Wait for the success message

---

**Run `npm run dev` to start the backend!** 🚀

