import re, pathlib
SRC = pathlib.Path(__file__).parent / 'source'; OUT = pathlib.Path('public')
LOGO = '<a class="logo" href="/"><span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>Cleared</a>'
FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;600;800&family=IBM+Plex+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;500&display=swap'

def head(title, desc, noindex=False, ld=''):
    robots = '<meta name="robots" content="noindex, nofollow">' if noindex else ''
    return ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
      f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{robots}<meta name="color-scheme" content="light dark">\n'
      f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="{FONTS}">\n'
      f'<link rel="stylesheet" href="/css/cleared.css">\n<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n{ld}</head>\n<body>\n<a class="skip" href="#main">Skip to content</a>\n')

def nav(links, cta, current=''):
    a = ''.join(f'<a href="{h}"{" aria-current=\"page\"" if h == current else ""}>{t}</a>' for h, t in links)
    return f'<header class="top"><div class="bar">{LOGO}<nav class="links" aria-label="Main">{a}</nav>{cta}</div></header>\n'

PUB_LINKS = [('/#how', 'How it works'), ('/pricing.html', 'Pricing'), ('/#eco', 'Partners'), ('/contact.html', 'Contact')]
def pub_nav(current=''): return nav(PUB_LINKS, '<a class="go" href="/app/signup.html">Send a shipment</a>', current)
APP_LINKS = [('/app/new-shipment.html', 'New shipment'), ('/app/shipment.html', 'My shipments'), ('/app/saved.html', 'Buyers'), ('/app/billing.html', 'Billing')]
def app_nav(current): return nav(APP_LINKS, '<button class="go" data-logout type="button">Log out</button>', current)

WORD = '<svg class="word" viewBox="0 0 1000 250" aria-hidden="true"><text x="2" y="215" font-size="270" textLength="996" lengthAdjust="spacingAndGlyphs" fill="none" stroke="var(--mute)" stroke-width="1.5">CLEARED</text></svg>'
LEGAL = '<span>© 2026 Cleared. A second check, not a guarantee. It does not replace your customs agent\'s filing.</span><nav aria-label="Legal"><a href="/terms.html">Terms of Service</a><a href="/privacy.html">Privacy Policy</a><a href="/refund.html">Refund Policy</a></nav>'
FOOT = ('<footer class="site"><div class="w"><ul class="big"><li><a href="/#how">How it works</a></li><li><a href="/pricing.html">Pricing</a></li><li><a href="/#eco">Partners</a></li><li><a href="/app/signup.html">Send a shipment</a></li></ul>'
  '<div class="cols"><div><h4>Product</h4><a href="/#how">Document checks</a><a href="/pricing.html">Pricing</a><a href="/sample-report.html">Sample report</a></div>'
  '<div><h4>Trust</h4><a href="/#how">Human review</a><a href="/refund.html">Refund terms</a></div><div><h4>Contact</h4><a href="/contact.html">WhatsApp</a><a href="/contact.html">Email</a></div></div>'
  f'{WORD}<div class="legal">{LEGAL}</div></div></footer>\n')
SLIM = f'<footer class="site slim"><div class="w"><div class="legal">{LEGAL}</div></div></footer>\n'
def scripts(*names): return '<script src="/js/api.js"></script>\n' + ''.join(f'<script src="/js/{n}.js"></script>\n' for n in names) + '</body>\n</html>\n'
SK = '<span class="skel" style="width:60%"></span>'
def loading(html):
    html = html.replace('<p class="msg">Loading…</p>', '<div class="card"><span class="skel" style="width:40%"></span><span class="skel" style="width:75%"></span><span class="skel" style="width:60%"></span></div>')
    html = re.sub(r'<tr><td colspan="(\d)" class="plain">Loading…</td></tr>', lambda m: f'<tr><td colspan="{m.group(1)}" class="plain">{SK}</td></tr>', html)
    html = re.sub(r'(class="stat" id="\w+")>…</div>', r'\1><span class="skel" style="width:5ch"></span></div>', html)
    def rows(m):
        n = m.group(1).count('<th>')
        return m.group(1) + '<tbody id="rows">' + ''.join('<tr>' + f'<td>{SK}</td>' * n + '</tr>' for _ in range(3)) + '</tbody>'
    return re.sub(r'(<thead>.*?</thead>)<tbody id="rows"></tbody>', rows, html, flags=re.S)
def write(path, html):
    html = loading(html)
    p = OUT / path; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(html, encoding='utf-8')

def fix(s):
    s = re.sub(r'href="(?!https?:|/|#|mailto:)([^"]+)"', lambda m: 'href="/' + m.group(1) + '"', s)
    s = s.replace('href="/index.html#', 'href="/#').replace('href="/index.html"', 'href="/"')
    s = re.sub(r'Your first three shipments are free', 'Your first 10 orders are free', s)
    s = re.sub(r'first three shipments', 'first 10 orders', s)
    s = s.replace('pay when the finished set arrives', 'pay after your report arrives')
    s = s.replace('You pay after the set arrives. If it fails our checklist, we refund our fee.', 'You pay after your report arrives, and we send the corrected set once payment is confirmed. If it fails our checklist, we refund our fee.')
    s = s.replace('You pay only after the finished, corrected document set arrives.', 'You pay after your mismatch report arrives, and we send the corrected set once payment is confirmed.')
    s = s.replace('Contact Cleared by WhatsApp', 'Contact Cleared by WhatsApp')
    return s

# Public pages: keep the existing copy, replace the shell
HEADS = {'contact.html': [('>Contact</h2>', '>Message us on WhatsApp or email</h2>')],
  'pricing.html': [('>Pricing</h2>', '>Rs 3,000 a shipment, and your first 10 are free</h2>'), ('>How it works</h2>', '>From upload to signed-off report in four steps</h2>')],
  'sample-report.html': [('>Sample mismatch report</h2>', '>A mismatch report for a Rotterdam shipment</h2>')]}
PUBLIC = {'terms.html': '', 'privacy.html': '', 'refund.html': '', 'contact.html': '/contact.html', 'pricing.html': '/pricing.html', 'sample-report.html': ''}
for name, cur in PUBLIC.items():
    src = (SRC / name).read_text(encoding='utf-8')
    title = re.search(r'<title>(.*?)</title>', src).group(1)
    desc = (re.search(r'"description": "(.*?)"', src) or re.search(r'"description": "(.*?)"', src)).group(1) if '"description"' in src else title
    ld = ''.join(m for m in re.findall(r'<script type="application/ld\+json">.*?</script>', src, re.S))
    ld = re.sub(r',\s*"contactPoint": \{.*?\}', '', ld, flags=re.S).replace('"sameAs": ["https://linkedin.com/company/cleared"]', '')
    ld = re.sub(r',\s*\}', '}', ld)
    body = re.search(r'(<section.*?</section>)', src, re.S).group(1)
    for a, c in HEADS.get(name, []): body = body.replace(a, c, 1)
    body = re.sub(r' (reveal-text|reveal-grid|reveal-item|reveal-card)', '', body)
    body = re.sub(r'<h2 class="section-title">(.*?)</h2>', r'<h1 class="section-title">\1</h1>', body, count=1, flags=re.S)
    body = re.sub(r'\s*<div class="row" style="margin-top:16px">\s*<a class="btn" href="#">Download corrected PDF pack</a>.*?</div>', '', body, flags=re.S)
    body = body.replace('Once you approve, we regenerate the documents so every field agrees. You download a single PDF pack ready for bank submission.', 'Once a person signs off, your reviewer sends the corrected set on WhatsApp, ready for the bank.')
    body = re.sub(r'<section', '<section class="first"', body, count=1)
    desc = desc.replace('email or LinkedIn', 'email')
    body = re.sub(r'\+92 300 0000000', '<!-- add the real WhatsApp number here -->coming at launch', body)
    body = body.replace('Follow Cleared for updates and export documentation tips.', 'Message us if you want updates on new features.')
    body = re.sub(r'<div>\s*<h3>LinkedIn</h3>.*?</div>\s*', '', body, flags=re.S)
    body = re.sub(r'<svg class="word".*', '', body, flags=re.S) if False else body
    page = head(title, desc.replace('"', "'"), False, ld) + pub_nav(cur) + '<main id="main" class="w">\n' + fix(body) + '\n</main>\n' + FOOT + '</body>\n</html>\n'
    write(name, fix(page) if False else page)

# Home: the reviewed landing page, with real links
art = (SRC / 'home.html').read_text(encoding='utf-8')
mid = art.split('</header>', 1)[1].split('<footer class="site">', 1)[0]
mid = mid.replace('<div class="w">\n\n<div class="hero">', '<main id="main"><div class="w">\n<div class="hero">', 1)
mid = mid.replace('<a class="btn" href="#tiers">Send your first shipment</a>', '<a class="btn" href="/app/signup.html">Send your first shipment</a>')
mid = mid.replace('<a class="btn alt" href="#">Send a shipment</a>', '<a class="btn alt" href="/app/signup.html">Send a shipment</a>')
mid = mid.replace('<a class="btn" href="#">Book a trial month</a>', '<a class="btn" href="/app/signup.html">Book a trial month</a>')
mid = mid.replace('<a class="btn alt" href="#">Talk to us</a>', '<a class="btn alt" href="/contact.html">Talk to us</a>')
mid = mid.replace('<div class="set" aria-live', '<div class="set" id="demo" aria-live')
mid = mid.replace('<table class="tbl">', '<table class="tbl" style="min-width:420px">') if 'min-width' not in mid else mid
mid = mid.replace('<h2>Pricing</h2>', '<h2>Rs 3,000 a shipment, and your first 10 are free</h2>').replace('<h2>Who joins as it grows</h2>', '<h2>Who joins once exporters are shipping</h2>').replace('<h2>How it works</h2>', '<h2>From upload to signed-off report in four steps</h2>')
mid = mid.replace('<a class="btn" href="/app/signup.html">Send your first shipment</a>', '<a class="btn lg" href="/app/signup.html">Send your first shipment</a>')
REPORT = '<section id="report"><div class="w"><div class="split"><div><h2>What comes back: each mismatch, in plain words</h2><p class="sub">Every difference names the document it came from and what it should say. A person checks the report before you see it.</p><a class="btn alt" href="/sample-report.html">See a full sample report</a></div><div class="card" style="margin:0"><h3>What to fix</h3><ul class="findings" style="margin-top:16px"><li><b>Gross weight</b>Packing list shows 4,280 kg. Expected 4,820 kg (digits swapped).</li><li><b>Cartons</b>Bill of lading shows 204. Expected 240 (digits swapped).</li><li><b>Consignee</b>Bill of lading shows Van Dijk BV as Van Dyk B.V. (spelling).</li></ul></div></div></div></section>\n\n'
mid = mid.replace('<section id="tiers">', REPORT + '<section id="tiers">', 1)
mid = fix(mid).rstrip() + '\n</main>\n'
home_ld = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Cleared","url":"https://cleared.devs.surf/","description":"Export document checking for Pakistani exporters: mismatch reports and corrected document sets, reviewed by a person before bank submission."}</script>\n'
write('index.html', head('Cleared: export documents, cross-checked per shipment', 'Cleared compares your invoice, packing list, bill of lading and LC across every shared field and sends back a corrected set, checked by a person. Made for exporters in Pakistan.', False, home_ld) + pub_nav() + mid + FOOT + '<script src="/js/home.js"></script>\n</body>\n</html>\n')

# Customer pages
def customer(name, title, cur, body, *js):
    write('app/' + name, head(title + ' | Cleared', title, True) + app_nav(cur) + '<main id="main" class="w">\n' + body + '\n</main>\n' + SLIM + scripts(*js))

customer('signup.html', 'Create your account', '', '''<div class="page narrow"><h2>Start with 10 free orders</h2>
<p class="sub">Enter your number and we text a 6-digit code to confirm it.</p>
<div class="card"><form id="signupForm" novalidate>
<div class="form-group"><label for="phone">Mobile number</label><input type="tel" id="phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="0300 1234567" required><p class="hint">Pakistani mobile numbers only.</p></div>
<div class="form-group"><label for="name">Full name</label><input type="text" id="name" name="name" autocomplete="name" required></div>
<button class="btn" type="submit">Send code</button><p class="msg" id="msg" role="alert"></p></form></div>
<p class="note">Already have an account? <a href="/app/login.html">Log in</a></p></div>''', 'signup')
customer('login.html', 'Log in', '', '''<div class="page narrow"><h2>Log in</h2>
<p class="sub">Enter your mobile number and we text you a 6-digit code.</p>
<div class="card"><form id="loginForm" novalidate>
<div class="form-group"><label for="phone">Mobile number</label><input type="tel" id="phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="0300 1234567" required></div>
<button class="btn" type="submit">Send code</button><p class="msg" id="msg" role="alert"></p></form></div>
<p class="note">New here? <a href="/app/signup.html">Create an account</a></p></div>''', 'login')
customer('verify.html', 'Enter your code', '', '''<div class="page narrow"><h2>Enter the code we texted you</h2>
<p class="sub">Sent to <b id="sentTo"></b>. It expires in 10 minutes.</p>
<div class="card"><form id="otpForm" novalidate>
<div class="form-group"><div class="otp-row" role="group" aria-label="6-digit code">''' + '<input type="text" class="otp-input" maxlength="1" autocomplete="one-time-code" inputmode="numeric" aria-label="Digit">' * 6 + '''</div></div>
<button class="btn" type="submit">Verify code</button> <button class="btn alt" type="button" id="resend">Resend code</button><p class="msg" id="msg" role="alert"></p></form></div></div>''', 'verify')
customer('new-shipment.html', 'New shipment', '/app/new-shipment.html', '''<div class="page" style="max-width:760px;margin:0 auto"><div class="page-head"><div><h2>Send a shipment for checking</h2><p>Upload the PO or LC and your documents. Scans and Excel files are fine.</p><p class="note" id="freeLeft" style="margin-top:8px"></p></div></div>
<div class="card"><form id="shipmentForm" novalidate>
<div class="form-group"><label for="reference">Your reference (optional)</label><input type="text" id="reference" name="reference" maxlength="40" placeholder="KHI-2291"></div>
<div class="form-group"><label for="buyer">Buyer or consignee</label><input type="text" id="buyer" name="buyer" maxlength="120" required></div>
<div class="form-group"><label for="lc">LC or PO terms</label><textarea id="lc" name="lc" rows="4" placeholder="Paste the LC clauses or PO details"></textarea><p class="hint">Needed to check your documents against the LC.</p></div>
<div class="form-group"><label for="docs">Documents</label><input type="file" id="docs" name="docs" multiple accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"><p class="hint">Invoice, packing list, bill of lading. PDF, image, Excel or CSV. Under 4 MB each. Send larger scans on WhatsApp.</p><ul class="doc-list" id="fileList"></ul></div>
<div class="form-group"><label for="forward">Or paste a forwarded message</label><textarea id="forward" name="forward" rows="3"></textarea></div>
<button class="btn" type="submit">Start check</button><p class="msg" id="msg" role="alert"></p></form></div>
<p class="note">An agent reads the documents, a person reviews the findings, and you get a WhatsApp message when the report is ready.</p></div>''', 'new-shipment')
customer('shipment.html', 'Shipment', '/app/shipment.html', '''<div class="page"><div class="page-head"><div><h2 id="title">My shipments</h2><p id="meta"></p></div><a class="btn" href="/app/new-shipment.html">New shipment</a></div><div id="root"><p class="msg">Loading…</p></div></div>''', 'shipment')
customer('billing.html', 'Billing', '/app/billing.html', '''<div class="page" style="max-width:760px;margin:0 auto"><div class="page-head"><div><h2>Billing</h2><p>Each shipment after the free ones is Rs 3,000 and up.</p></div></div>
<div class="card"><div class="stat" id="freeLeft">…</div><p class="sub" style="margin:4px 0 0">free orders left</p></div>
<div class="card"><h3>Invoices</h3><div class="scroll"><table class="tbl" style="min-width:420px"><thead><tr><th>Shipment</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody id="invoices"><tr><td colspan="4" class="plain">Loading…</td></tr></tbody></table></div></div>
<div class="card"><h3>How to pay</h3><p class="sub" style="margin-bottom:0">After your report is ready we send payment details on WhatsApp. You can pay by bank transfer, JazzCash, Easypaisa or Raast. Put your shipment reference in the payment note. We confirm payment by hand, then send the corrected set.</p></div></div>''', 'billing')
customer('saved.html', 'Buyers', '/app/saved.html', '''<div class="page" style="max-width:760px;margin:0 auto"><div class="page-head"><div><h2>Buyers</h2></div></div>
<div class="card"><div class="scroll"><table class="tbl" style="min-width:420px"><thead><tr><th>Buyer</th><th>Shipments</th><th>Last shipped</th></tr></thead><tbody id="buyers"><tr><td colspan="3" class="plain">Loading…</td></tr></tbody></table></div></div></div>''', 'saved')
customer('team-seats.html', 'Team seats', '', '''<div class="page" style="max-width:760px;margin:0 auto"><div class="page-head"><div><h2>Team seats</h2></div></div>
<div class="card"><h3>Your plan</h3><div class="stat" id="plan">…</div><p class="sub" style="margin:8px 0 0">Desk is Rs 35,000 a month for up to 20 shipments. <a href="/contact.html">Message us</a> to start a trial month.</p></div>
<div class="card"><h3>Team</h3><div class="scroll"><table class="tbl" style="min-width:420px"><thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Joined</th></tr></thead><tbody id="seats"></tbody></table></div></div></div>''', 'team')

# Staff consoles
def staff(kind, name, title, cur, body, *js):
    items = ([('/reviewer/queue.html', 'Review queue')] if kind == 'reviewer' else [('/admin/orders.html', 'Orders'), ('/admin/users.html', 'Users'), ('/admin/costs.html', 'Costs'), ('/admin/refunds.html', 'Refunds'), ('/reviewer/queue.html', 'Review queue')])
    links = ''.join(f'<a href="{h}"{" aria-current=\"page\"" if h == cur else ""}>{t}</a>' for h, t in items)
    ic = '<span class="ic" style="width:28px;height:28px;border-radius:7px;background:var(--sea);display:grid;place-items:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>'
    write(f'{kind}/{name}', head(title + ' | Cleared', title, True) + f'<div class="app-shell"><aside class="app-sidebar"><div class="brand">{ic}{"Admin" if kind == "admin" else "Reviews"}</div><nav aria-label="Console">{links}</nav><button class="out" data-logout type="button">Log out</button></aside>\n<main id="main" class="app-main">\n{body}\n</main></div>\n' + scripts(*js))

TH = lambda *c: '<thead><tr>' + ''.join(f'<th>{x}</th>' for x in c) + '</tr></thead>'
staff('reviewer', 'queue.html', 'Review queue', '/reviewer/queue.html', f'''<div class="page-head"><div><h2>Review queue</h2><p>Shipments waiting for a person. Oldest first.</p></div></div>
<div class="card scroll"><table class="queue-table" id="tbl">{TH('Shipment', 'Exporter', 'Files', 'To check', 'Status', 'Sent', '')}<tbody id="rows"></tbody></table>
<div class="empty" id="empty" hidden><h3>Nothing waiting</h3><p>New shipments appear here when they arrive.</p></div></div>''', 'queue')
staff('reviewer', 'review.html', 'Review shipment', '/reviewer/queue.html', '''<div class="page-head"><div><h2 id="title">Review</h2><p id="meta"></p></div></div><div id="root"><p class="msg">Loading…</p></div>''', 'review')
staff('admin', 'orders.html', 'Orders', '/admin/orders.html', f'''<div class="page-head"><div><h2>Orders</h2><p>Every shipment. Confirm payments here once the money arrives.</p></div></div>
<div class="card scroll"><table class="queue-table">{TH('Shipment', 'Exporter', 'Status', 'Sent', 'Fee', 'Payment')}<tbody id="rows"></tbody></table></div><p class="msg" id="msg" role="alert"></p>''', 'admin-orders')
staff('admin', 'users.html', 'Users', '/admin/users.html', f'''<div class="page-head"><div><h2>Users</h2><p>Customers, reviewers and admins. Free orders used shows who is near the limit.</p></div></div>
<div class="card scroll"><table class="queue-table">{TH('Name', 'Phone', 'Role', 'Shipments', 'Free orders used', 'Joined', 'Status', '')}<tbody id="rows"></tbody></table></div>
<div class="card"><h3>Add staff</h3><form id="staffForm" class="row" style="align-items:flex-end"><div class="form-group" style="flex:1;min-width:160px"><label for="n">Name</label><input id="n" name="name" required></div><div class="form-group" style="flex:1;min-width:160px"><label for="p">Mobile number</label><input id="p" name="phone" inputmode="tel" required></div><div class="form-group"><label for="r">Role</label><select id="r" name="role"><option value="reviewer">Reviewer</option><option value="admin">Admin</option></select></div><div class="form-group"><button class="btn" type="submit">Save</button></div></form><p class="msg" id="msg" role="alert"></p></div>''', 'admin-users')
staff('admin', 'costs.html', 'Costs', '/admin/costs.html', '''<div class="page-head"><div><h2>Cost per shipment</h2><p>Model usage plus reviewer time. Use it to set prices and spot shipments that lose money.</p></div></div>
<div class="card"><h3>Average cost per completed shipment</h3><div class="stat" id="total">…</div><p class="sub" style="margin:6px 0 0" id="count"></p></div>
<div class="cards3"><div class="card"><h3>Model usage</h3><div class="stat" id="model">…</div></div><div class="card"><h3>Reviewer time</h3><div class="stat" id="review">…</div></div><div class="card"><h3>Minutes per shipment</h3><div class="stat" id="mins">…</div></div></div>''', 'admin-costs')
staff('admin', 'refunds.html', 'Refunds', '/admin/refunds.html', f'''<div class="page-head"><div><h2>Refunds</h2><p>Customers ask for a refund when a corrected set missed a mismatch. We refund our fee, paid back through the same channel.</p></div></div>
<div class="card scroll"><table class="queue-table">{TH('Shipment', 'Exporter', 'Reason', 'Amount', 'Requested', 'Status', '')}<tbody id="rows"></tbody></table><div class="empty" id="empty" hidden><h3>No refund requests</h3></div></div><p class="msg" id="msg" role="alert"></p>''', 'admin-refunds')
print('pages built')
