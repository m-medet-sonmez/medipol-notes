-- Seed Courses
-- 'ON CONFLICT (course_code) DO NOTHING' prevents duplicates

INSERT INTO public.courses (course_code, course_name, description)
VALUES
  ('YON101', 'Yöneylem Araştırması', 'Yöneylem Araştırması dersi notları ve podcastleri'),
  ('DAV101', 'Davranış Bilimleri', 'Davranış Bilimleri dersi notları ve podcastleri'),
  ('PRG101', 'Programlama Dilleri', 'Programlama Dilleri dersi notları ve podcastleri'),
  ('ALG101', 'Algoritma ve Veri Yapıları', 'Algoritma ve Veri Yapıları dersi notları ve podcastleri'),
  ('IST101', 'İstatistik', 'İstatistik dersi notları ve podcastleri')
ON CONFLICT (course_code) DO NOTHING;
