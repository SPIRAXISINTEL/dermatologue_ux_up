import test from "node:test";
import assert from "node:assert/strict";
import { slugify, validSlug, markdownToHtml, articlePage, videoPage } from "../functions/_lib/cms.js";

test("slugify normalizes French accents and punctuation", () => {
  assert.equal(slugify("Acné de l'adulte à Tanger !"), "acne-de-l-adulte-a-tanger");
});
test("slug validation rejects path traversal and invalid separators", () => {
  assert.equal(validSlug("acne-adulte-tanger"), true);
  assert.equal(validSlug("../admin"), false);
  assert.equal(validSlug("-acne"), false);
});
test("markdown renderer escapes raw HTML and supports basic formatting", () => {
  const html = markdownToHtml("## Conseils\n\nTexte **important**.\n\n<script>alert(1)</script>");
  assert.match(html, /<h2>Conseils<\/h2>/);
  assert.match(html, /<strong>important<\/strong>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
test("article server render includes canonical, medical metadata and escaped title", () => {
  const html = articlePage({slug:"acne-tanger",title:"Acné <adulte>",excerpt:"Résumé médical.",body_markdown:"## Présentation\n\nContenu médical suffisamment clair.",category:"Acné",author_name:"Dr Yassir Chaibi",published_at:"2026-11-12T10:00:00.000Z",updated_at:"2026-11-12T10:00:00.000Z"},{SITE_URL:"https://dermatologue-tanger.com"});
  assert.match(html,/rel="canonical" href="https:\/\/dermatologue-tanger.com\/articles\/acne-tanger\//);
  assert.match(html,/<h1>Acné &lt;adulte&gt;<\/h1>/);
  assert.match(html,/MedicalWebPage/);
});
test("video server render uses privacy-enhanced YouTube embed and VideoObject", () => {
  const html = videoPage({slug:"acne-video",title:"Comprendre l'acné",description:"Explication pédagogique détaillée.",youtube_id:"abcdefghijk",youtube_url:"https://youtu.be/abcdefghijk",published_at:"2026-11-12T10:00:00.000Z",seo_description:"Vidéo sur l'acné."},{SITE_URL:"https://dermatologue-tanger.com"});
  assert.match(html,/youtube-nocookie\.com\/embed\/abcdefghijk/);
  assert.match(html,/VideoObject/);
  assert.match(html,/<html lang="fr">/);
  assert.match(html,/"inLanguage":"ar-MA"/);
  assert.match(html,/Vidéo pédagogique · Darija marocaine/);
  assert.doesNotMatch(html,/النص الكامل/);
});

test("Cloudflare Access JWT is verified and editor cannot publish", async () => {
  const { webcrypto } = await import("node:crypto");
  const originalFetch = globalThis.fetch;
  const pair = await webcrypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
  const jwk = await webcrypto.subtle.exportKey("jwk",pair.publicKey); jwk.kid="test-key";
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header=encode({alg:"RS256",typ:"JWT",kid:"test-key"});
  const payload=encode({aud:"aud-test",iss:"https://team.cloudflareaccess.com",exp:Math.floor(Date.now()/1000)+300,email:"editor@example.com"});
  const bytes=new TextEncoder().encode(`${header}.${payload}`);
  const signature=Buffer.from(await webcrypto.subtle.sign("RSASSA-PKCS1-v1_5",pair.privateKey,bytes)).toString("base64url");
  const request=new Request("https://dermatologue-tanger.com/api/cms/articles",{headers:{"cf-access-jwt-assertion":`${header}.${payload}.${signature}`,origin:"https://dermatologue-tanger.com"}});
  globalThis.fetch=async()=>new Response(JSON.stringify({keys:[jwk]}),{status:200,headers:{"content-type":"application/json"}});
  try {
    const {requireCms}=await import("../functions/_lib/cms.js");
    const env={DB:{},CF_ACCESS_AUD:"aud-test",CF_ACCESS_ISSUER:"https://team.cloudflareaccess.com",CMS_EDITOR_EMAILS:"editor@example.com",DOCTOR_EMAIL:"doctor@example.com"};
    const allowed=await requireCms(request,env);
    assert.equal(allowed.identity.role,"editor");
    const denied=await requireCms(request,env,{doctorOnly:true});
    assert.equal(denied.response.status,403);
  } finally { globalThis.fetch=originalFetch; }
});
