CREATE TABLE "event_survey_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text,
	"event_title" text NOT NULL,
	"overall_rating" smallint,
	"favorite_parts" text[] DEFAULT '{}' NOT NULL,
	"favorite_parts_other" text,
	"future_topics" text[] DEFAULT '{}' NOT NULL,
	"future_topics_other" text,
	"talk_format" text,
	"talk_format_other" text,
	"next_event_likelihood" smallint,
	"suggestions" text,
	"talk_feedback_enabled" boolean DEFAULT false NOT NULL,
	"talks_overall_rating" smallint,
	"talk_feedback" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"legacy_message" text,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_survey_response_overall_rating_check" CHECK ("event_survey_response"."overall_rating" BETWEEN 0 AND 5),
	CONSTRAINT "event_survey_response_next_event_likelihood_check" CHECK ("event_survey_response"."next_event_likelihood" BETWEEN 0 AND 5),
	CONSTRAINT "event_survey_response_talks_overall_rating_check" CHECK ("event_survey_response"."talks_overall_rating" BETWEEN 0 AND 5)
);
--> statement-breakpoint
CREATE INDEX "event_survey_response_event_id_idx" ON "event_survey_response" USING btree ("event_id" text_ops);--> statement-breakpoint
CREATE INDEX "event_survey_response_created_at_idx" ON "event_survey_response" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "event_survey_response_ip_hash_idx" ON "event_survey_response" USING btree ("ip_hash" text_ops);
--> statement-breakpoint
WITH survey_event (event_id, event_title) AS (
  VALUES
    ('prague-1', 'Bonfire@Prague #1 - The Gathering'),
    ('prague-2', 'Bonfire@Prague #2 - The Dreamweavers'),
    ('prague-3', 'Bonfire@Prague #3 - The Convergence'),
    ('prague-4', 'Bonfire@Prague #4 - The Mystic Voyagers'),
    ('prague-5', 'Bonfire@Prague #5 - Knights of the Digital Age'),
    ('prague-6', 'Bonfire@Prague #6 - The Shape of Echoes'),
    ('prague-7', 'Bonfire@Prague #7 - Whispers of the Void'),
    ('prague-8', 'Bonfire@Prague #8 - Forge of Possibility'),
    ('prague-9', 'Bonfire@Prague #9 - Architects of the Unseen'),
    ('prague-10', 'Bonfire@Prague #10'),
    ('zlin-1', 'Bonfire@Zlin #1 - The Pioneers'),
    ('zlin-2', 'Bonfire@Zlin #2 - The Horizon Seekers'),
    ('zlin-3', 'Bonfire@Zlin #3 - The Infinite Wanderers'),
    ('zlin-4', 'Bonfire@Zlin #4 - The Boundless Expedition'),
    ('zlin-5', 'Bonfire@Zlin #5 - Beyond the Frame'),
    ('zlin-6', 'Bonfire@Zlin #6 - Horizon Drift'),
    ('zlin-7', 'Bonfire@Zlin #7')
),
survey_talk (event_id, talk_index, topic) AS (
  VALUES
    ('prague-1', 0, 'Rozhovor o historii studia CINEMAX'),
    ('prague-1', 1, 'Unreal Editor Scripting je váš kamarád'),
    ('prague-1', 2, 'Retro jako řemen'),
    ('prague-2', 0, 'Bzzzt: Od prototypování po produkci'),
    ('prague-2', 1, 'Happy Game: Veselý život neveselé hry'),
    ('prague-2', 2, 'Hrady a Pixely: Středověk ve videohrách očima historika'),
    ('prague-3', 0, 'UE5: Rozhodovací stromy jednoduše'),
    ('prague-3', 1, 'Survival jinak'),
    ('prague-3', 2, 'Chill Chat #2 - Tobias Stolz-Zwilling (Warhorse Studios)'),
    ('prague-4', 0, 'Umění bastlit (váš kód nemusí být za každou cenu perfektní)'),
    ('prague-4', 1, 'Witcher 3 – narativní rozbor začátku herní legendy'),
    ('prague-4', 2, 'Zmatek v inventáři i nepřeskočitelné cutscény. Čím nás videohry rozčilují pořád dokola?'),
    ('prague-5', 0, 'CPU, paralelní výpočty a Unity: Úvod pro všechny'),
    ('prague-5', 1, 'Budiž světlo: Principy herního osvětlování'),
    ('prague-5', 2, 'Modrák & Friends Live - Design Kingdom Come: Deliverance II s Viktorem Bocanem'),
    ('prague-6', 0, 'Image Stylization with Image Processing'),
    ('prague-6', 1, 'Témata a Technologie Herní Hudby'),
    ('prague-6', 2, 'Chill Chat #3 - David Vávra (Geewa)'),
    ('prague-7', 0, 'Světy a Biomy Mafia: The Old Country'),
    ('prague-7', 1, 'Vyprávění hudbou v Kingdom Come: Deliverance'),
    ('prague-7', 2, 'Top 5 CZ her Šárky a Jaromíra'),
    ('prague-8', 0, 'Jai: Jak vypadá jazyk herního vývojáře Jonathana Blowa?'),
    ('prague-8', 1, 'Jako začínat odznova - vývoj her pro virtuální realitu'),
    ('prague-8', 2, 'Jak mluvit o hrách, s hráči a mezi hráči'),
    ('prague-8', 2, 'Živá diskuze na Bonfire'),
    ('prague-9', 0, 'Naše cesta Godotem, aneb je už na čase začít brát Godot vážně?'),
    ('prague-9', 1, 'Mýty o game artu'),
    ('prague-9', 2, 'Chill Chat #4 - Martin Pohl (ZNK)'),
    ('prague-9', 2, 'Interview with Martin Pohl (Řezník)'),
    ('prague-10', 0, 'Jak se rodil vizuál pro PitPanic'),
    ('zlin-1', 0, 'Vývoj vizuálního stylu indie hry'),
    ('zlin-1', 1, 'Hledání vlastní cesty game designéra'),
    ('zlin-1', 2, 'Jak výběr technologie může ovlivnit vaši vývojářskou cestu'),
    ('zlin-2', 0, 'Fortnite Editor for Non Fornite Folks'),
    ('zlin-2', 1, 'Digital painting & concept art'),
    ('zlin-2', 2, 'Chill Chat #1 - Michael Petr (VisionGame.cz)'),
    ('zlin-3', 0, 'ChatGPT, vytvoř mi hru (Využití AI pro vývoj her)'),
    ('zlin-3', 1, 'Průzkum trhu na vlakovou hru která není simulátor'),
    ('zlin-3', 2, 'Just Two, příběh jednoho studia, aneb jak to (ne)dělat'),
    ('zlin-4', 0, 'Proč Godot? Alternativa, která mění pravidla hry'),
    ('zlin-4', 1, 'Unity WebGL build-rest-repeat'),
    ('zlin-4', 2, 'Historická spolupráce na Last Train Home'),
    ('zlin-5', 0, 'Fotogrammetrie: z pixelů do polygonů'),
    ('zlin-5', 1, 'Pixel Art 2.0: Rendering a Shadery'),
    ('zlin-5', 2, 'Barvy Smrti - od inspirace k dílu'),
    ('zlin-6', 0, 'To be announced'),
    ('zlin-6', 0, 'Unity ScriptableObjects: Best Practices and Data-Driven Design'),
    ('zlin-6', 1, 'Concept to Comeback: The Evolution of Crime Boss'),
    ('zlin-6', 2, 'Ako zvýšiť šance na úspech Vášho štúdia? Alebo post-mortem ako ste o ňom ešte nepremýšľali.'),
    ('zlin-7', 0, 'Dá se po práci vyvíjet hra, dát dohromady tým a nezešílet? Jak vznikal Dredline Express.')
),
favorite_part_label (key, label) AS (
  VALUES
    ('technology_talk', 'Technology talk'),
    ('art_audio_management_talk', 'Art / Audio / Management talk'),
    ('interview_or_live_podcast', 'Interview or live podcast'),
    ('networking_social_time', 'Networking / social time')
),
future_topic_label (key, label) AS (
  VALUES
    ('technology', 'Technology (engines, tools, coding)'),
    ('art_animation_workflows', 'Art & animation workflows'),
    ('game_audio_sound_design_music', 'Game audio & sound design & music'),
    ('game_production_project_management', 'Game production & project management'),
    ('game_marketing_community', 'Game marketing & community'),
    ('behind_the_scenes_interviews', 'Behind-the-scenes interviews'),
    ('live_podcasts_panels', 'Live podcasts or panels')
),
talk_format_label (key, label) AS (
  VALUES
    ('perfect_as_is', 'Perfect as is'),
    ('talks_should_be_shorter', 'Talks should be shorter'),
    ('talks_could_go_deeper', 'Talks could go deeper / be longer'),
    ('more_time_for_qna', 'More time for Q&A')
),
moved AS (
  DELETE FROM "contact_submissions"
  WHERE "email" = 'events-survey@bnf.events'
  RETURNING "id", "subject", "message", "ip_hash", "created_at"
),
extracted AS (
  SELECT
    m."id",
    m."message",
    m."ip_hash",
    m."created_at",
    COALESCE(
      substring(m."message" from '\nEvent: ([^\n]*)'),
      NULLIF(regexp_replace(m."subject", '^Event survey response:? ?', ''), ''),
      'Unknown'
    ) AS event_title,
    substring(m."message" from '\nOverall enjoyment: ([^\n]*)') AS overall_rating,
    substring(m."message" from '\nFavorite parts: ([^\n]*)') AS favorite_parts,
    substring(m."message" from '\nFuture topics: ([^\n]*)') AS future_topics,
    substring(m."message" from '\nTalk length and format: ([^\n]*)') AS talk_format,
    substring(m."message" from '\nLikelihood to attend next event: ([^\n]*)') AS next_event_likelihood,
    substring(m."message" from '\nSuggestions: (.*?)\n\nTalk feedback: ') AS suggestions,
    m."message" ~ '\n\nTalk feedback: Enabled' AS talk_feedback_enabled,
    substring(m."message" from '\nTalk quality overall: ([^\n]*)') AS talks_overall_rating,
    substring(m."message" from '\nTalk quality overall: [^\n]*\n(.*)$') AS talk_section
  FROM moved m
),
parsed AS (
  SELECT e.*, se.event_id
  FROM extracted e
  LEFT JOIN survey_event se ON se.event_title = e.event_title
)
INSERT INTO "event_survey_response" (
  "id",
  "event_id",
  "event_title",
  "overall_rating",
  "favorite_parts",
  "favorite_parts_other",
  "future_topics",
  "future_topics_other",
  "talk_format",
  "talk_format_other",
  "next_event_likelihood",
  "suggestions",
  "talk_feedback_enabled",
  "talks_overall_rating",
  "talk_feedback",
  "legacy_message",
  "ip_hash",
  "created_at"
)
SELECT
  p."id",
  p.event_id,
  p.event_title,
  CASE WHEN p.overall_rating ~ '^[0-5]$' THEN p.overall_rating::smallint END,
  CASE
    WHEN p.favorite_parts IS NULL OR p.favorite_parts = 'No answer' THEN '{}'::text[]
    ELSE ARRAY(
      SELECT COALESCE(l.key, part.value)
      FROM unnest(
        string_to_array(regexp_replace(p.favorite_parts, '(^|; )Other(: .*)?$', ''), '; ')
      ) WITH ORDINALITY AS part(value, ord)
      LEFT JOIN favorite_part_label l ON l.label = part.value
      WHERE part.value <> ''
      ORDER BY part.ord
    ) || CASE WHEN p.favorite_parts ~ '(^|; )Other(: |$)' THEN ARRAY['other'] ELSE '{}'::text[] END
  END,
  substring(p.favorite_parts from '(?:^|; )Other: (.*)$'),
  CASE
    WHEN p.future_topics IS NULL OR p.future_topics = 'No answer' THEN '{}'::text[]
    ELSE ARRAY(
      SELECT COALESCE(l.key, part.value)
      FROM unnest(
        string_to_array(regexp_replace(p.future_topics, '(^|; )Other(: .*)?$', ''), '; ')
      ) WITH ORDINALITY AS part(value, ord)
      LEFT JOIN future_topic_label l ON l.label = part.value
      WHERE part.value <> ''
      ORDER BY part.ord
    ) || CASE WHEN p.future_topics ~ '(^|; )Other(: |$)' THEN ARRAY['other'] ELSE '{}'::text[] END
  END,
  substring(p.future_topics from '(?:^|; )Other: (.*)$'),
  CASE
    WHEN p.talk_format IS NULL OR p.talk_format = 'No answer' THEN NULL
    WHEN p.talk_format ~ '^Other(: |$)' THEN 'other'
    ELSE COALESCE(
      (SELECT l.key FROM talk_format_label l WHERE l.label = p.talk_format),
      p.talk_format
    )
  END,
  substring(p.talk_format from '^Other: (.*)$'),
  CASE WHEN p.next_event_likelihood ~ '^[0-5]$' THEN p.next_event_likelihood::smallint END,
  NULLIF(p.suggestions, 'No answer'),
  p.talk_feedback_enabled,
  CASE WHEN p.talks_overall_rating ~ '^[0-5]$' THEN p.talks_overall_rating::smallint END,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'talkIndex', t.talk_index,
          'topic', COALESCE(
            t.topic,
            substring(x.heading from '^(.*) \([^()]*\)$'),
            x.heading
          ),
          'speaker', CASE
            WHEN t.topic IS NOT NULL
              THEN regexp_replace(substr(x.heading, length(t.topic) + 3), '\)$', '')
            ELSE COALESCE(substring(x.heading from ' \(([^()]*)\)$'), '')
          END,
          'rating', CASE WHEN x.rating ~ '^[0-5]$' THEN x.rating::smallint END,
          'comment', NULLIF(x.comment, 'No answer')
        )
        ORDER BY chunk.ord
      )
      FROM regexp_split_to_table(
        p.talk_section,
        '\n(?=[^\n]* \| Rating: (?:[0-5]|No answer) \| Comment: )'
      ) WITH ORDINALITY AS chunk(value, ord)
      CROSS JOIN LATERAL (
        SELECT
          m[1] AS heading,
          m[2] AS rating,
          m[3] AS comment
        FROM regexp_match(
          chunk.value,
          '^([^\n]*) \| Rating: ([0-5]|No answer) \| Comment: (.*)$'
        ) AS m
      ) x
      LEFT JOIN LATERAL (
        SELECT st.talk_index, st.topic
        FROM survey_talk st
        WHERE st.event_id = p.event_id
          AND left(x.heading, length(st.topic) + 2) = st.topic || ' ('
        ORDER BY length(st.topic) DESC
        LIMIT 1
      ) t ON true
      WHERE x.heading IS NOT NULL
    ),
    '[]'::jsonb
  ),
  p."message",
  p."ip_hash",
  p."created_at"
FROM parsed p;
