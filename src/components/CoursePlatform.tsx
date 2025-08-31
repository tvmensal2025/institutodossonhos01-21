import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Star, Play, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_minutes: number;
  difficulty_level: string;
  price: number;
  category: string;
  is_published: boolean;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  module_id: string;
  is_free: boolean;
  created_at: string;
}

const CoursePlatform = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our Course interface
      const mappedCourses: Course[] = (data || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        instructor_name: 'Instrutor', // Default instructor name
        duration_minutes: course.duration_minutes || 60,
        difficulty_level: course.difficulty_level || 'Iniciante',
        price: 0,
        category: course.category || 'Geral',
        is_published: course.is_published,
        created_at: course.created_at
      }));

      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Map the data to match our Lesson interface
      const mappedLessons: Lesson[] = (data || []).map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        video_url: lesson.video_url || '',
        duration_minutes: lesson.duration_minutes || 0,
        order_index: lesson.order_index,
        module_id: lesson.module_id || '',
        is_free: !lesson.is_premium,
        created_at: lesson.created_at
      }));

      setLessons(mappedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => setSelectedCourse(null)}
          className="mb-6"
        >
          ← Voltar aos Cursos
        </Button>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{selectedCourse.title}</CardTitle>
                <CardDescription>{selectedCourse.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                  <Play className="h-16 w-16 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Aulas do Curso</h3>
                  {lessons.length === 0 ? (
                    <p className="text-gray-500">Carregando aulas...</p>
                  ) : (
                    lessons.map((lesson) => (
                      <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {lesson.duration_minutes} minutos
                              </p>
                            </div>
                            {lesson.is_free && (
                              <Badge variant="secondary">Grátis</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Instrutor: {selectedCourse.instructor_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedCourse.duration_minutes} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Nível: {selectedCourse.difficulty_level}</span>
                </div>
                <Badge variant="outline">{selectedCourse.category}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Plataforma de Cursos</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Aprenda com nossos especialistas e transforme sua saúde
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.instructor_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_minutes}min</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{course.category}</Badge>
                  <Badge variant="secondary">{course.difficulty_level}</Badge>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setSelectedCourse(course);
                    fetchLessons(course.id);
                  }}
                >
                  Ver Curso
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursePlatform;
