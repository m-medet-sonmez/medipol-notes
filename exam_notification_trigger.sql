-- Sınav oluşturulduğunda öğrencilere bildirim gönderen Trigger

CREATE OR REPLACE FUNCTION public.handle_new_exam_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notify_students = true THEN
    INSERT INTO public.notifications (user_id, title, message, type, action_url)
    SELECT 
      id, 
      'Yeni Sınav Eklendi: ' || NEW.title, 
      (SELECT course_name FROM public.courses WHERE id = NEW.course_id) || ' dersi için yeni bir sınav tarihi belirlendi.',
      'exam', 
      '/dashboard/takvim'
    FROM public.profiles 
    WHERE role = 'student';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_exam_created ON public.exams;
CREATE TRIGGER on_exam_created
  AFTER INSERT ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_exam_notification();
