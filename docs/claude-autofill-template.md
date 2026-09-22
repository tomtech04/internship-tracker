# Autofilling applications from a Claude chat

When you finish applying somewhere, you usually have a pile of loose
details lying around — a confirmation email, the job posting text, a
screenshot of the portal. Instead of transcribing that by hand into every
field, hand it to a Claude chat with the prompt below, then paste Claude's
reply into the **Paste from Claude** box on the New Application page (or
the application's edit page) and click **Parse & fill form**. Review the
filled-in fields before saving — this only ever pre-fills the form, it
never submits anything on its own.

## The prompt

Copy everything in the code block below into a new Claude conversation,
then paste your raw application details right after it (the confirmation
email, the job posting, or just describe it) in the same message:

```text
Extract the following details about my internship application and reply with ONLY a single fenced code block containing these fields, one per line, in this exact order. Leave a field blank if you don't know it. Use YYYY-MM-DD for dates. For Source, Resume Version, Tier, and Status, use exactly one of the listed allowed values (pick the closest match if you're not sure — don't invent new ones). Notes must be the last field and can span multiple lines.

Company:
Role Title:
Team:
Location:
Job URL:
Req ID:
Source: (one of: Career Fair, Referral, Company Site, LinkedIn, Handshake, Other)
Resume Version: (one of: Space, Robotics, Other)
Tier: (one of: Dream, Target, Safety)
Status: (one of: Wishlist, Applied, Online Assessment, Phone Screen, Technical Interview, Final Round, Offer, Accepted, Rejected, Withdrawn, Ghosted)
Date Applied:
Deadline:
Compensation:
Notes:

Here are the details:
[paste the confirmation email, job posting, or describe the application here]
```

This exact prompt is also available as a "Copy template" button directly
in the app's "Paste from Claude" section, so you don't need to come back
to this file every time.

## What gets filled in

Every field above maps onto the application form except **Company**,
which is matched (or created) by name the same way quick add and CSV
import handle it — you won't need an existing company selected first.
Portal login credentials aren't part of this flow; those live on the
company's own page since they're shared across every application to that
company.

## Why a copy-paste round trip instead of something automatic

This app has no network calls out to any AI provider — it's a fully local
SQLite-backed tool with no API keys to manage. Doing the extraction in a
separate Claude conversation keeps it that way: paste in, paste back, no
new dependency or credential for a personal project to hold onto.
