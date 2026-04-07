-- ============================================================
-- JUT — Seed Data for Local Development & Testing
-- Run AFTER schema.sql
-- ============================================================
-- HOW TO USE:
-- 1. Sign up at http://localhost:3000/en/signup
-- 2. Supabase Dashboard → SQL Editor → run:
--    SELECT id FROM auth.users LIMIT 1;
-- 3. Copy that UUID and replace every 'YOUR_USER_ID_HERE' below
-- 4. Run this file in SQL Editor
-- ============================================================

DO $$
DECLARE
  uid UUID := 'YOUR_USER_ID_HERE'; -- ← replace this
BEGIN

-- ── Business Config ───────────────────────────────────────────
INSERT INTO business_configs (
  user_id, business_name, business_type, website, phone, email,
  country, timezone, instagram_handle, whatsapp_number,
  ai_tone, primary_language,
  qualification_criteria, escalation_rules, automation_goals,
  faqs, offers
) VALUES (
  uid,
  'StyleCo Colombia',
  'Tienda de ropa y accesorios',
  'https://styleco.co',
  '+57 300 123 4567',
  'hola@styleco.co',
  'CO',
  'America/Bogota',
  '@styleco_colombia',
  '+57 300 123 4567',
  'friendly',
  'es',
  'Presupuesto mínimo $200.000 COP, decisor de compra, necesidad inmediata',
  'Escalar si el cliente pide hablar con una persona real o si el pedido supera $1.000.000 COP',
  'Capturar mínimo 50 leads por semana. Cerrar mínimo 10 ventas mensuales.',
  '[
    {"id":"faq-1","question":"¿Hacen envíos a todo Colombia?","answer":"Sí, enviamos a todo el país con 2-3 días hábiles."},
    {"id":"faq-2","question":"¿Cuáles son los métodos de pago?","answer":"Aceptamos PSE, tarjeta de crédito, Nequi y Daviplata."},
    {"id":"faq-3","question":"¿Tienen política de devoluciones?","answer":"Sí, 30 días para cambios sin preguntas."}
  ]'::jsonb,
  '[
    {"id":"offer-1","name":"Paquete Básico","description":"3 piezas a elección","price":150000,"currency":"COP"},
    {"id":"offer-2","name":"Paquete Premium","description":"6 piezas + envío gratis","price":280000,"currency":"COP"},
    {"id":"offer-3","name":"Paquete VIP","description":"10 piezas + descuento especial","price":450000,"currency":"COP"}
  ]'::jsonb
) ON CONFLICT (user_id) DO NOTHING;

-- ── Products ──────────────────────────────────────────────────
INSERT INTO products (user_id, name, description, price, currency, category, type, status) VALUES
  (uid, 'Paquete Starter JUT', 'Configuración completa + 3 automatizaciones + soporte 30 días', 297, 'USD', 'Software', 'package', 'active'),
  (uid, 'Paquete Growth JUT', 'Automatizaciones ilimitadas + CRM + Analítica avanzada', 697, 'USD', 'Software', 'package', 'active'),
  (uid, 'Paquete Elite JUT', 'Todo incluido + voz + todos los canales + soporte premium', 1497, 'USD', 'Software', 'package', 'active'),
  (uid, 'Servicio de Onboarding', 'Configuración personalizada de JUT por nuestro equipo', 500, 'USD', 'Servicio', 'service', 'active'),
  (uid, 'Consultoría mensual', 'Sesión mensual de optimización de automatizaciones', 150, 'USD', 'Servicio', 'subscription', 'active');

-- ── Leads ─────────────────────────────────────────────────────
INSERT INTO leads (user_id, full_name, email, phone, instagram_handle, source, status, stage, tags, notes) VALUES
  (uid, 'María García',      'maria@gmail.com',    '+57 310 111 1111', '@maria_garcia',   'instagram_comment', 'qualified',   'intent',        ARRAY['caliente','instagram'],      'Muy interesada en paquete premium. Preguntó por precio varias veces.'),
  (uid, 'Carlos Rodríguez',  'carlos@hotmail.com', '+57 320 222 2222', '@carlos_r',       'instagram_dm',      'contacted',   'consideration', ARRAY['tibio','dm'],                'Solicitó catálogo completo por DM.'),
  (uid, 'Laura Martínez',    'laura@gmail.com',    '+57 315 333 3333', '@laurita_m',      'instagram_comment', 'new',         'awareness',     ARRAY['nuevo'],                     NULL),
  (uid, 'Andrés Pérez',      'andres@outlook.com', '+57 301 444 4444', '@andres_perez',   'whatsapp',          'converted',   'purchase',      ARRAY['cliente','vip'],             'Compró paquete Growth. Muy satisfecho.'),
  (uid, 'Sofia Torres',      'sofia@gmail.com',    '+57 314 555 5555', '@sofi_torres',    'instagram_comment', 'qualified',   'intent',        ARRAY['caliente'],                  'Lista para comprar esta semana.'),
  (uid, 'Diego Hernández',   NULL,                 '+57 318 666 6666', '@diego_h',        'instagram_dm',      'new',         'interest',      ARRAY['nuevo','joven'],             NULL),
  (uid, 'Valentina Castro',  'vale@gmail.com',     '+1 305 777 7777',  '@vale_castro',    'instagram_comment', 'contacted',   'interest',      ARRAY['usa','ingles'],              'Colombiana en Miami. Interesada en envíos internacionales.'),
  (uid, 'Juan Pablo López',  'jp@empresa.com',     '+57 312 888 8888', '@jplopez_biz',    'manual',            'qualified',   'consideration', ARRAY['b2b','empresa'],             'Dueño de boutique, quiere comprar al por mayor.'),
  (uid, 'Isabella Gómez',    'isa@gmail.com',      '+57 316 999 9999', '@isa_gomez',      'instagram_comment', 'lost',        'interest',      ARRAY['perdido','precio'],          'Encontró precio mejor en otro lado.'),
  (uid, 'Sebastián Vargas',  'seba@outlook.com',   '+57 311 000 0000', '@seba_v',         'form',              'new',         'awareness',     ARRAY['nuevo','formulario'],        NULL);

-- ── Automations ───────────────────────────────────────────────
INSERT INTO automations (user_id, name, description, status, trigger, actions, conditions, run_count) VALUES
  (uid,
   'Respuesta automática a comentarios en Reels',
   'Detecta comentarios con palabras clave en Reels y envía DM automático',
   'active',
   '{"type":"instagram_comment","platform":"instagram","content_type":"reel","keywords":["precio","info","quiero","interesa","cuanto","costo"]}'::jsonb,
   '[
     {"id":"a1","type":"create_lead","order":1,"config":{}},
     {"id":"a2","type":"send_comment_reply","order":2,"config":{"reply":"¡Hola! Te envié toda la información por DM 📩"}},
     {"id":"a3","type":"send_dm","order":3,"config":{"message":"¡Hola {{lead.name}}! 👋 Vi que comentaste en nuestro post. Aquí tienes toda la info que pediste. ¿Tienes alguna pregunta?"},"delay_seconds":5},
     {"id":"a4","type":"add_tag","order":4,"config":{"tag":"instagram-reel"}}
   ]'::jsonb,
   '[]'::jsonb,
   247
  ),
  (uid,
   'Seguimiento a leads sin respuesta',
   'Re-engage leads que no respondieron en más de 24 horas',
   'active',
   '{"type":"manual","platform":"internal"}'::jsonb,
   '[
     {"id":"b1","type":"send_dm","order":1,"config":{"message":"¡Hola de nuevo! 👋 Solo quería asegurarme de que recibiste la información. ¿Tienes alguna duda? Estoy aquí para ayudarte 😊"}},
     {"id":"b2","type":"add_tag","order":2,"config":{"tag":"seguimiento"}}
   ]'::jsonb,
   '[]'::jsonb,
   89
  ),
  (uid,
   'Calificación automática con IA',
   'Usa IA para calificar leads basado en criterios del negocio',
   'active',
   '{"type":"instagram_dm","platform":"instagram"}'::jsonb,
   '[
     {"id":"c1","type":"ai_response","order":1,"config":{}},
     {"id":"c2","type":"create_lead","order":2,"config":{}}
   ]'::jsonb,
   '[]'::jsonb,
   156
  ),
  (uid,
   'Bienvenida a nuevos seguidores',
   'Envía mensaje de bienvenida cuando alguien sigue la cuenta',
   'paused',
   '{"type":"new_follower","platform":"instagram"}'::jsonb,
   '[
     {"id":"d1","type":"send_dm","order":1,"config":{"message":"¡Bienvenido/a a StyleCo! 🎉 Gracias por seguirnos. Tenemos los mejores looks para ti. ¿Qué tipo de ropa buscas?"}}
   ]'::jsonb,
   '[]'::jsonb,
   34
  );

-- ── Social Triggers ───────────────────────────────────────────
INSERT INTO social_triggers (user_id, platform, content_type, keywords, reply_comment, reply_dm, comment_reply_text, status) VALUES
  (uid, 'instagram', 'reel',     ARRAY['precio','info','quiero','costo','cuanto','interesa'],         TRUE, TRUE, '¡Hola! Te envié todo por DM 📩', 'active'),
  (uid, 'instagram', 'post',     ARRAY['disponible','stock','comprar','quiero uno','lo quiero'],       TRUE, TRUE, '¡Claro! Revisa tu DM 💬',         'active'),
  (uid, 'instagram', 'carousel', ARRAY['precio','info','donde compro','link'],                         TRUE, TRUE, '¡Toda la info en tu DM! 📲',      'active'),
  (uid, 'instagram', 'any',      ARRAY['hola','info','ayuda','help'],                                  FALSE, TRUE, NULL,                               'inactive');

-- ── Conversations ─────────────────────────────────────────────
WITH new_convos AS (
  INSERT INTO conversations (user_id, lead_id, channel, status, participant_name, participant_handle, last_message, last_message_at, unread_count, is_automated)
  SELECT
    uid,
    l.id,
    'instagram',
    CASE WHEN l.status = 'new' THEN 'active' ELSE 'active' END,
    l.full_name,
    l.instagram_handle,
    CASE
      WHEN l.status = 'qualified' THEN '¡Perfecto! ¿Cuándo podemos hablar? 🎯'
      WHEN l.status = 'contacted' THEN 'Gracias por la info, lo voy a pensar'
      ELSE 'Hola, vi tu publicación y me interesó mucho'
    END,
    NOW() - (random() * INTERVAL '2 days'),
    CASE WHEN l.status = 'new' THEN 1 ELSE 0 END,
    TRUE
  FROM leads l
  WHERE l.user_id = uid
    AND l.status IN ('qualified','contacted','new')
  LIMIT 5
  RETURNING id, lead_id, participant_name
)
UPDATE leads SET conversation_id = nc.id
FROM new_convos nc
WHERE leads.id = nc.lead_id AND leads.user_id = uid;

-- ── Orders ────────────────────────────────────────────────────
INSERT INTO orders (
  user_id, customer_name, customer_email, customer_phone,
  items, subtotal, total, currency, status, payment_status, notes
) VALUES
  (
    uid,
    'Andrés Pérez', 'andres@outlook.com', '+57 301 444 4444',
    '[{"product_id":"demo","product_name":"Paquete Growth JUT","quantity":1,"unit_price":697,"total":697}]'::jsonb,
    697, 697, 'USD', 'completed', 'paid',
    'Cliente satisfecho. Renovará en 3 meses.'
  ),
  (
    uid,
    'Juan Pablo López', 'jp@empresa.com', '+57 312 888 8888',
    '[{"product_id":"demo","product_name":"Paquete Elite JUT","quantity":1,"unit_price":1497,"total":1497}]'::jsonb,
    1497, 1497, 'USD', 'confirmed', 'paid',
    'Empresa grande. Posible cliente recurrente.'
  ),
  (
    uid,
    'María García', 'maria@gmail.com', '+57 310 111 1111',
    '[{"product_id":"demo","product_name":"Paquete Starter JUT","quantity":1,"unit_price":297,"total":297}]'::jsonb,
    297, 297, 'USD', 'pending', 'pending',
    'Esperando confirmación de pago.'
  );

END $$;
