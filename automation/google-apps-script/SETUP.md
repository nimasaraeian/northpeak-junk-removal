# Lead sheet + review emails — setup

One-time setup, about 5 minutes. You need a Google account that can create a
Sheet and send email. Everything happens in Google — you never touch the
website or Vercel.

When you're done, every quote request from northpeakjunk.com lands in a
spreadsheet row, and marking a row **Done** emails that customer a review
request automatically.

---

## 1. Create the spreadsheet

1. Go to [sheets.new](https://sheets.new) to make a blank spreadsheet.
2. Name it something you'll recognise — e.g. **NorthPeak Leads**.
3. At the bottom left, double-click the tab name (`Sheet1`) and rename it to
   exactly:

   ```
   Leads
   ```

   The name matters. Capital L, no spaces.

4. In row 1, type these nine headers, one per cell, starting in cell A1:

   | A | B | C | D | E | F | G | H | I |
   |---|---|---|---|---|---|---|---|---|
   | Date | Name | Phone | Email | Service | City | Source | Status | Review Sent |

That's the whole sheet. Leave row 2 onward empty.

---

## 2. Add the script

1. In the menu, click **Extensions → Apps Script**. A new tab opens.
2. Delete whatever is already in the editor (usually an empty
   `function myFunction() {}`).
3. Open `Code.gs` from this folder, copy **all** of it, and paste it in.
4. Click the save icon (💾).

---

## 3. Add the "Done" trigger

This is what sends the review emails. It has to be added by hand — the script
alone won't do it.

1. Still in the Apps Script tab, click the **clock icon** (⏰ Triggers) in the
   left sidebar.
2. Click **+ Add Trigger**, bottom right.
3. Set the four dropdowns:
   - **Choose which function to run:** `onStatusEdit`
   - **Choose which deployment should run:** `Head`
   - **Select event source:** `From spreadsheet`
   - **Select event type:** `On edit`
4. Click **Save**.
5. Google asks you to sign in and approve. Pick your account. If you see
   **"Google hasn't verified this app"**, click **Advanced** → **Go to
   (your project name)** → **Allow**. This is normal for your own scripts.

> The approval is what lets the script send email as you. Without it, rows
> still arrive but no review emails go out.

---

## 4. Publish the web address

This is the address the website posts leads to.

1. Top right, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `Lead intake` (anything works)
   - **Execute as:** **Me (your@email)**
   - **Who has access:** **Anyone**
4. Click **Deploy**, approve again if asked.
5. Copy the **Web app URL**. It ends in `/exec` and looks like:

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

**"Who has access: Anyone" is required** — the website is not signed in to your
Google account, so it can't post otherwise. The URL is unguessable, and the
script only ever writes rows; it never reads anything back out.

---

## 5. Hand off the URL

Send that `/exec` URL to the marketing lead. They set it as `LEAD_WEBHOOK_URL`
in Vercel (Production, Config) and redeploy.

**You're done after this step.** Nothing else on your side.

Until that variable is set, the website carries on exactly as before — quote
requests still reach the team by Telegram, they just don't appear in the sheet
yet.

---

## 6. Test it (do this once the URL is live)

Ask the marketing lead to confirm the variable is set and the site redeployed,
then run these three checks in order.

- [ ] **A lead arrives.** Submit a test request on northpeakjunk.com — use your
      own email address. Within a few seconds a new row appears in the Leads
      tab, with Status `New` and Review Sent empty.
- [ ] **Done sends the email.** In that row, type `Done` in the **Status**
      column (H) and press Enter. Within a minute: the review email arrives at
      your address, and column I turns to `Yes`.
- [ ] **It doesn't send twice.** Change Status to something else and back to
      `Done`. Nothing new should arrive — column I already says `Yes`, and that
      is what blocks a repeat.

Then delete the test row.

### If something doesn't work

| What you see | What to check |
|---|---|
| No row appears | The tab is named exactly `Leads`; the marketing lead has set the variable and redeployed |
| Row appears, no email | The trigger from step 3 — reopen ⏰ Triggers and confirm `onStatusEdit` / `From spreadsheet` / `On edit` is listed |
| Column I says `No email` | That lead left no email address. Nothing is wrong; there is nobody to write to |
| Email went to spam | Check your spam folder — it's sent from your own Google account, so this is usually a one-off |

To see what the script did, open **Extensions → Apps Script → Executions** in
the left sidebar. Failures are logged there with a reason.

---

## What the emails say

Subject:

```
Thanks from NorthPeak — quick favour?
```

Body:

```
Hi {name},

Thanks for choosing NorthPeak Junk Removal today! If you were happy with the job, a quick Google review would mean the world to our small local crew:

https://g.page/r/CQpStjbMaZkzEBM/review

Thanks again!
— Nima & the NorthPeak team
```

`{name}` is the name from column B. If that cell is empty the email opens with
"Hi there,".

To change the wording, edit `reviewBody_` near the top of `Code.gs` and save.
To change the review link, edit `REVIEW_LINK` on line 2. No redeploy is needed
for email changes — only step 4 needs repeating if you change `doPost`.
