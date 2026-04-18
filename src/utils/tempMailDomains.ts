/**
 * Comprehensive list of known disposable / temporary email domains.
 * Used for client-side signup validation.
 * Keep this list in sync with the backend list in .github/scripts/auth-handler.js
 */
const TEMP_MAIL_DOMAINS = new Set([
  // ── 10-minute / short-lived services ──────────────────────────────────────
  '10minutemail.com','10minutemail.net','10minutemail.org','10minutemail.de',
  '10minutemail.co.uk','10minutemail.cf','10minutemail.ga','10minutemail.gq',
  '10minutemail.ml','10minutemail.tk','10minemail.com','10mails.net',
  'minutemailbox.com','20minutemail.com','20minutemail.it','throwam.com',
  'throwam.net','trashmail.com','trashmail.at','trashmail.io','trashmail.me',
  'trashmail.net','trashmail.org','trashmail.xyz','trashmail.de','trashmail.eu',
  'trashmail.app','trashmailer.com','trash-mail.at','tempinbox.com',
  'tempr.email','tempmail.com','tempmail.net','tempmail.org','tempmail.de',
  'tempmail.us','tempmail.eu','tempmail.it','tempmail.co','tempmail.biz',
  'tempmail.io','temp-mail.org','temp-mail.ru','temp-mail.io','tempm.com',
  'temp-inbox.com','temporary-mail.com','temporaryemail.com','temporaryemail.net',
  'temporaryinbox.com','mytemp.email','mytempemail.com','mytempmail.com',
  'tempe.email','tempsky.com',

  // ── Mailinator family ─────────────────────────────────────────────────────
  'mailinator.com','mailinator.net','mailinator.org','mailinator2.com',
  'mailinater.com','mailinator.gq','suremail.info','tradermail.info',
  'dispostable.com','tempan.com','spam4.me','sharklasers.com',
  'guerrillamail.com','guerrillamail.net','guerrillamail.org','guerrillamail.biz',
  'guerrillamail.de','guerrillamail.info','guerrillamailblock.com','grr.la',
  'spam.la','spam.org.es',

  // ── YOPmail family ────────────────────────────────────────────────────────
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',

  // ── Jetable / Spamgourmet ────────────────────────────────────────────────
  'jetable.org','jetable.net','jetable.pp.ua','jetable.com',
  'spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'spamfree24.org','spamfree.eu','spam.su',

  // ── Maildrop / Mailnull / Discard ────────────────────────────────────────
  'maildrop.cc','mailnull.com','discard.email','discardmail.com',
  'discardmail.de','spamcorpse.com','nospam4.us','nospamfor.us',
  'nospammail.net','no-spam.ws','nobulk.com',

  // ── Fake / Trash inbox services ──────────────────────────────────────────
  'fakeinbox.com','fakeinbox.net','fakeinbox.org','fakeinboxemail.com',
  'fake-email.pp.ua','spamex.com','spamevader.net','mungbeansoup.com',
  'spam.su','spamgob.com','mailnesia.com','mailnew.com',

  // ── Guerrilla / Throw-away ───────────────────────────────────────────────
  'throwam.com','throwam.net','throwaway.email','throwaway.email',
  'throwem.away.com','filzmail.com','filzmail.de',

  // ── Getairmail / GetNada ─────────────────────────────────────────────────
  'getairmail.com','getnada.com','getnada.co','nada.email',
  'nakedtruth.biz','neinmail.de',

  // ── Mohmal / owly ────────────────────────────────────────────────────────
  'mohmal.com','owlymail.com','einrot.com',

  // ── CrazyMailing / Crap ─────────────────────────────────────────────────
  'crazymailing.com','crap.handcrafted.jp','crapmail.org',

  // ── Dispostable / Incognito ──────────────────────────────────────────────
  'dispostable.com','incognitomail.com','incognitomail.net','incognitomail.org',
  'inboxalias.com','inboxclean.com','inboxclean.org',

  // ── Spamhole / Anonymbox ─────────────────────────────────────────────────
  'spamhole.com','anonymbox.com','anonymail.de','anonymail.org',
  'anonymouse.de','antichef.com','antichef.net',

  // ── MailExpire / Kill ────────────────────────────────────────────────────
  'mailexpire.com','killmail.com','killmail.net','klzlk.com',

  // ── Wegwerfmail / Einweg ─────────────────────────────────────────────────
  'wegwerfmail.de','wegwerfmail.net','wegwerfmail.org',
  'einrot.com','einweg-email.de',

  // ── Mailbucket / Mailcat ────────────────────────────────────────────────
  'mailbucket.org','mailcat.biz','mailcatch.com',
  'mailfall.com','mailforspam.com','mailfreeonline.com',
  'mailguard.me','mailhazard.com','mailhazard.us',

  // ── Maileater / Mailsucker ───────────────────────────────────────────────
  'maileater.com','mailsucker.net','mailzilla.com','mailzilla.org',

  // ── Spamoverlord / Deadaddress ──────────────────────────────────────────
  'deadaddress.com','spamoverlord.com','supergreatmail.com',

  // ── Sneakemail / AddictiveMail ───────────────────────────────────────────
  'sneakemail.com','addictivemail.com','amilegit.com',

  // ── AirMail / FastMail throwaway ────────────────────────────────────────
  'airmailhub.com','fastacura.com','fastchevy.com',

  // ── Bouncr / Divermail ───────────────────────────────────────────────────
  'bouncr.com','divermail.com','divermail.net',

  // ── Emailondeck / Mailpoof ───────────────────────────────────────────────
  'emailondeck.com','mailpoof.com','spambot.us','spamboy.com',

  // ── MintEmail / WPG ─────────────────────────────────────────────────────
  'mintemail.com','wpg.im','mt2014.com','mt2015.com','mt2016.com',

  // ── GishPuppy / Hatespam ─────────────────────────────────────────────────
  'gishpuppy.com','hatespam.org','h8s.org','herp.in',

  // ── Mailtemp / Mailrock ──────────────────────────────────────────────────
  'mailtemp.net','mailrock.biz','mailscrap.com','mailshell.com',

  // ── Bugmenot / Shiftmail ─────────────────────────────────────────────────
  'bugmenot.com','shiftmail.com','shiftmail.net',

  // ── Trashdevil / iHateSpam ──────────────────────────────────────────────
  'trashdevil.com','trashdevil.de','ihateyoualot.info','iheartspam.org',

  // ── Fleckens / Filtemail ─────────────────────────────────────────────────
  'fleckens.hu','filtemail.com',

  // ── Meltmail / Netmails ──────────────────────────────────────────────────
  'meltmail.com','netmails.com','netmails.net',

  // ── Hmamail / Comsafe ────────────────────────────────────────────────────
  'hmamail.com','comsafe-mail.net',

  // ── MyCashAtHome / DestroyEmailAddress ──────────────────────────────────
  'mycashatHome.com','destroyemailaddress.com',

  // ── Klick-tipp trash / Throwam ─────────────────────────────────────────
  'e4ward.com','kaspop.com','kasmail.com','keepmymail.com',

  // ── Kukumail / Lortemail ─────────────────────────────────────────────────
  'kukumail.com','lortemail.dk','lovemeleaveme.com',

  // ── NowMyMail / Lroid ────────────────────────────────────────────────────
  'nowmymail.com','lroid.com','lopl.co.uk',

  // ── Moburl / Mos.ru ─────────────────────────────────────────────────────
  'moburl.com','mos.ru','mox.pp.ua',

  // ── Haltospam / Nameplanet ──────────────────────────────────────────────
  'haltospam.com','nameplanet.com',

  // ── Ieh-mail / Ieatspam ─────────────────────────────────────────────────
  'ieh-mail.de','ieatspam.eu','ieatspam.info',

  // ── Insorg / Mailproxsy ─────────────────────────────────────────────────
  'insorg.org','mailproxsy.com','mailquack.com',

  // ── Notmailinator / Noref ────────────────────────────────────────────────
  'notmailinator.com','noref.in','nowhere.org',

  // ── Nullbox / Nwldx ─────────────────────────────────────────────────────
  'nullbox.info','nwldx.com',

  // ── Spamgob / Spamslicer ────────────────────────────────────────────────
  'spamgob.com','spamslicer.com','spamspot.com','spamstack.net',
  'spamthis.co.uk','spamthisplease.com','spamtroll.net',

  // ── ReceiveMail / Safetypost ─────────────────────────────────────────────
  'receivemail.com','safetypost.de',

  // ── Secure-mail / Sneakmail ─────────────────────────────────────────────
  'secure-mail.biz','sneakmail.de',

  // ── TheCriminals / TopMail ───────────────────────────────────────────────
  'thecriminals.com','topranklist.de',

  // ── Uroid / Veryrealemail ────────────────────────────────────────────────
  'uroid.com','veryrealemail.com',

  // ── Whyspam / Wuzupmail ──────────────────────────────────────────────────
  'whyspam.me','wuzupmail.net',

  // ── Xagloo / Xemaps ─────────────────────────────────────────────────────
  'xagloo.co','xagloo.com','xemaps.com','xents.com',

  // ── YEW / Yomail ────────────────────────────────────────────────────────
  'yep.it','yomail.info','yopweb.com',

  // ── ZC / Zoemail ─────────────────────────────────────────────────────────
  'zc.com','zehnminutenmail.de','zoemail.com','zoemail.net','zoemail.org',

  // ── Additional popular services ──────────────────────────────────────────
  'mailnull.com','mailpick.biz','mailtothis.com','mailtrash.net',
  'mailtv.net','mailtv.tv','mailworks.org','mbx.cc',
  'spamab.com','spamcon.org','spam.care','spamdecoy.net',
  'spam.dk','spamfree24.com','spamfree24.de','spamfree24.eu',
  'spamfree24.info','spamfree24.net','spamfree24.org',
  'tempalias.com','tempail.com','tempinbox.me',
  'trashcanmail.com','trashinbox.com','trashinbox.net',
  'willhackforfood.biz','willselfdestruct.com',
  'wronghead.com','wuorio.com',
  'xoxy.net','xyz.am',
  'zain.org','zetmail.com',
]);

/**
 * Returns true if the email uses a known disposable/temp mail domain.
 */
export function isTempMailEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return TEMP_MAIL_DOMAINS.has(domain);
}

export default TEMP_MAIL_DOMAINS;
