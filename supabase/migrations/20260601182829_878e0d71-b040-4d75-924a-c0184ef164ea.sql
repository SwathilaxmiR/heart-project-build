
-- Alerts table: civic alerts (power cut, water cut, road work, etc.)
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('power_cut','water_cut','road_work','flooding','traffic','civic','crime','politics','weather','business','health','sports','other')),
  category TEXT NOT NULL DEFAULT 'civic',
  title TEXT NOT NULL,
  title_ta TEXT,
  summary TEXT NOT NULL,
  summary_ta TEXT,
  areas TEXT[] NOT NULL DEFAULT '{}',
  ward TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','breaking')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  source TEXT NOT NULL,
  source_url TEXT,
  source_count INT NOT NULL DEFAULT 1,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_areas ON public.alerts USING GIN(areas);
CREATE INDEX idx_alerts_type ON public.alerts(type);
CREATE INDEX idx_alerts_category ON public.alerts(category);
CREATE INDEX idx_alerts_created ON public.alerts(created_at DESC);

GRANT SELECT ON public.alerts TO anon, authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts are publicly readable" ON public.alerts FOR SELECT TO anon, authenticated USING (true);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT,
  email TEXT,
  areas TEXT[] NOT NULL DEFAULT '{}',
  alert_types TEXT[] NOT NULL DEFAULT '{}',
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp','email','both')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','ta')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

GRANT SELECT, INSERT ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscriptions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "No public reads on subs" ON public.subscriptions FOR SELECT TO anon, authenticated USING (false);

-- Seed alerts (realistic Coimbatore civic data)
INSERT INTO public.alerts (type, category, title, title_ta, summary, summary_ta, areas, ward, severity, start_time, end_time, source, source_count, lat, lng) VALUES
('road_work','civic','Emergency road closure on Avinashi Road near Brookefields','அவிநாசி சாலை அவசர சாலை மூடல்','CCMC announces emergency road closure on Avinashi Road near Brookefields — diversions in effect via Race Course Road.','கோவை மாநகராட்சி அவசர சாலை மூடலை அறிவித்துள்ளது. மாற்று வழி: ரேஸ் கோர்ஸ் சாலை.',ARRAY['Avinashi Road','Brookefields'],'Ward 47','breaking',NOW(),NOW() + INTERVAL '8 hours','CCMC',3,11.0233,76.9747),
('civic','civic','CCMC approves ₹240 crore Ukkadam lake restoration project','உக்கடம் ஏரி மீட்பு திட்டத்திற்கு ₹240 கோடி ஒப்புதல்','The Coimbatore City Municipal Corporation passed the proposal in Tuesday''s council meeting. The restoration covers 85 acres and includes desilting, bund repair, and a public walkway.','கோவை மாநகராட்சி செவ்வாய்க்கிழமை கூட்டத்தில் இந்த திட்டத்தை அங்கீகரித்தது. 85 ஏக்கர் பரப்பளவில் மீட்பு பணிகள்.',ARRAY['Ukkadam'],'Ward 67','high',NOW() - INTERVAL '18 minutes',NULL,'The Hindu',3,10.9889,76.9559),
('traffic','traffic','Avinashi Road flyover work to cause delays at Gandhipuram','கந்திபுரத்தில் போக்குவரத்து தாமதம்','Contractors begin pile-foundation work for the new flyover. Traffic police have announced alternate routes via Race Course Road and Variety Hall Road.','புதிய மேம்பாலம் பணிகள் தொடங்குகின்றன. மாற்று வழிகள் அறிவிக்கப்பட்டுள்ளன.',ARRAY['Gandhipuram','Avinashi Road'],'Ward 35','medium',NOW() - INTERVAL '42 minutes',NOW() + INTERVAL '3 days','Times of India',2,11.0183,76.9725),
('business','business','TIDEL Park Coimbatore Phase 2 gets final clearance — 8,000 IT jobs expected','டைடல் பார்க் கட்டம் 2-க்கு ஒப்புதல்','The Tamil Nadu government gave environmental clearance for the 12-acre Phase 2 expansion at Vilankurichi Road. Completion targeted for late 2027.','தமிழ்நாடு அரசு சுற்றுச்சூழல் அனுமதி வழங்கியுள்ளது.',ARRAY['Vilankurichi'],'Ward 12','medium',NOW() - INTERVAL '1 hour',NULL,'New Indian Express',2,11.0691,77.0028),
('weather','weather','மழை எச்சரிக்கை: கோவையில் வெள்ளிக்கிழமை கனமழை','Heavy rain alert for Coimbatore on Friday','IMD Coimbatore issued a yellow alert for Friday. Residents in low-lying areas near Noyyal River advised to stay cautious. Singanallur lake levels are at 78%.','வானிலை ஆய்வு மையம் வெள்ளிக்கிழமைக்கு மஞ்சள் எச்சரிக்கை விடுத்துள்ளது.',ARRAY['Singanallur','Noyyal belt'],'Ward 80','high',NOW() - INTERVAL '2 hours',NOW() + INTERVAL '2 days','Dinamalar',1,11.0086,77.0470),
('crime','crime','Two arrested for ATM skimmer installation at RS Puram branch','ஆர்.எஸ். புரத்தில் ஏடிஎம் மோசடி: இருவர் கைது','Coimbatore City Police cybercrime wing arrested two accused from Erode. The skimmer had collected data from over 40 cards. Bank customers advised to check statements.','கோவை சைபர் கிரைம் போலீஸ் ஈரோட்டில் இருந்து இருவரை கைது செய்தது.',ARRAY['RS Puram'],'Ward 28','medium',NOW() - INTERVAL '3 hours',NULL,'Daily Thanthi',1,11.0024,76.9483),
('politics','politics','Mayor Ranganayaki announces ward-level grievance camps in all 100 wards','மாநகராட்சி மேயர் அனைத்து வார்டுகளிலும் குறை தீர்க்கும் முகாம்','CCMC Mayor R. Ranganayaki announced monthly grievance camps for residents to directly report issues to ward engineers. First camp: Ward 12 (Saibaba Colony) on June 5.','கோவை மேயர் மாதாந்திர குறை தீர்க்கும் முகாமை அறிவித்துள்ளார். முதல் முகாம்: சாய்பாபா காலனி.',ARRAY['Saibaba Colony','All wards'],'All Wards','low',NOW() - INTERVAL '4 hours',NULL,'Dinamani',4,11.0286,76.9456),
('power_cut','civic','Scheduled power shutdown in Peelamedu and Hopes College — 9 AM to 2 PM','பீளமேடு பகுதியில் மின் தடை','TANGEDCO scheduled maintenance shutdown for Peelamedu 110KV substation. Affects Peelamedu, Hopes College, KGISL areas. Restoration by 2 PM.','டாங்கெட்கோ பராமரிப்பு வேலைகள் காரணமாக மின் தடை.',ARRAY['Peelamedu','Hopes College'],'Ward 52','high',NOW() + INTERVAL '14 hours',NOW() + INTERVAL '19 hours','TANGEDCO',1,11.0297,77.0019),
('water_cut','civic','Water supply suspended in Saibaba Colony tomorrow for pipeline repair','சாய்பாபா காலனியில் நாளை குடிநீர் தடை','CCMC announces 24-hour water supply suspension in Saibaba Colony and Rathinapuri due to main pipeline repair work near Sanganur Pallam.','முக்கிய குழாய் பழுது பார்ப்பு காரணமாக 24 மணி நேரம் தண்ணீர் இல்லை.',ARRAY['Saibaba Colony','Rathinapuri'],'Ward 12','high',NOW() + INTERVAL '20 hours',NOW() + INTERVAL '44 hours','CCMC',2,11.0356,76.9244),
('road_work','traffic','Pothole repair work on Trichy Road between Singanallur and Ondipudur','திருச்சி சாலையில் சாலை பழுது பார்ப்பு','Highways department starts pothole filling on the 4 km stretch between Singanallur and Ondipudur. Single-lane traffic expected from 10 PM to 5 AM.','நெடுஞ்சாலை துறை 4 கி.மீ. தூரத்திற்கு சாலை பணிகளை தொடங்கியுள்ளது.',ARRAY['Singanallur','Ondipudur','Trichy Road'],'Ward 80','medium',NOW() - INTERVAL '5 hours',NOW() + INTERVAL '2 days','CCMC',1,11.0058,77.0388),
('flooding','civic','Waterlogging reported at Lanka Corner after morning showers','லங்கா கார்னரில் தண்ணீர் தேங்கல்','Residents report severe waterlogging at Lanka Corner junction. CCMC pump teams dispatched. Avoid the area during peak hours.','லங்கா கார்னர் சந்திப்பில் கடுமையான தண்ணீர் தேங்கல். மாநகராட்சி குழுவினர் வந்துள்ளனர்.',ARRAY['Lanka Corner','RS Puram'],'Ward 28','high',NOW() - INTERVAL '6 hours',NULL,'r/Coimbatore',2,11.0067,76.9521),
('health','health','Dengue cases rise in Kuniyamuthur — corporation steps up fogging','குனியமுத்தூரில் டெங்கு அதிகரிப்பு','Health department reports 14 new dengue cases in Kuniyamuthur ward this week. Fogging operations scheduled for all 100 wards over next 10 days.','சுகாதார துறை இந்த வாரம் 14 புதிய டெங்கு வழக்குகளை அறிவித்துள்ளது.',ARRAY['Kuniyamuthur'],'Ward 88','medium',NOW() - INTERVAL '7 hours',NULL,'The Hindu',1,10.9622,76.9292),
('sports','sports','Kovai Kings advance to TNPL semis after thrilling win at SNR Stadium','கோவை கிங்ஸ் TNPL அரையிறுதிக்கு முன்னேற்றம்','In a nail-biting finish, Kovai Kings beat Chepauk Super Gillies by 4 runs at SNR College Cricket Stadium. Semifinal scheduled at Chennai on June 8.','கோவை கிங்ஸ் சென்னை சூப்பர் கில்லீஸை 4 ரன்களுக்கு வென்றது.',ARRAY['SNR Stadium','Saravanampatti'],'Ward 2','low',NOW() - INTERVAL '8 hours',NULL,'Times of India',2,11.0775,77.0073),
('politics','politics','MLA inaugurates new community hall at Selvapuram','செல்வபுரத்தில் புதிய சமுதாய மண்டபம்','Coimbatore South MLA inaugurated a ₹3.2 crore community hall at Selvapuram. The hall has a capacity of 800 and will be available for public functions.','கோவை தெற்கு எம்எல்ஏ ₹3.2 கோடி மதிப்பிலான சமுதாய மண்டபத்தை திறந்து வைத்தார்.',ARRAY['Selvapuram'],'Ward 56','low',NOW() - INTERVAL '10 hours',NULL,'Dinamalar',1,10.9928,76.9333);
