import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Target, 
  CheckCircle, 
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  Clock,
  Shield,
  Monitor,
  Gift,
  Dumbbell,
  Brain
} from "lucide-react";
import { CourseModal } from "./CourseModal";
import { ModuleModal } from "./ModuleModal";
import { LessonModal } from "./LessonModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  is_published: boolean;
  is_premium: boolean;
  instructor_name: string;
  duration_minutes: number;
  difficulty_level: string;
  price: number;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  structure_type?: 'course_lesson' | 'course_module_lesson';
  modules_count?: number;
  lessons_count?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  course_id?: string; // Agora pode ser null para módulos independentes
  order_index: number;
  created_at: string;
  thumbnail_url?: string;
  structure_type?: 'module_lesson' | 'standalone_module';
  lessons_count?: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  module_id?: string; // Agora pode ser null para aulas diretas no curso
  course_id?: string; // Para aulas diretamente no curso
  video_url: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  is_completed: boolean;
  is_premium: boolean;
  created_at: string;
  thumbnail_url?: string;
}

export const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalStudents: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      const { count: modulesCount } = await supabase
        .from('course_modules')
        .select('*', { count: 'exact', head: true });

      const { count: lessonsCount } = await (supabase as any)
        .from('course_lessons')
        .select('*', { count: 'exact', head: true });

      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalCourses: coursesCount || 0,
        totalModules: modulesCount || 0,
        totalLessons: lessonsCount || 0,
        totalStudents: studentsCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar contagem de módulos e aulas para cada curso
      const coursesWithCounts = await Promise.all(
        (data || []).map(async (course) => {
          const { data: modulesData } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', course.id);

          // Buscar aulas através dos módulos
          const moduleIds = modulesData?.map(m => m.id) || [];
          let lessonsCount = 0;
          
          if (moduleIds.length > 0) {
            const { count } = await (supabase as any)
              .from('course_lessons')
              .select('*', { count: 'exact', head: true })
              .in('module_id', moduleIds);
            lessonsCount = count || 0;
          }

          return {
            id: course.id,
            title: course.title,
            description: course.description || '',
            category: course.category || 'Geral',
            difficulty_level: course.difficulty_level || 'Iniciante',
            duration_minutes: course.duration_minutes || 60,
            instructor_name: 'Instrutor',
            is_premium: false,
            is_published: course.is_published,
            price: 0,
            thumbnail_url: '',
            created_at: course.created_at,
            updated_at: course.created_at,
            modules_count: modulesData?.length || 0,
            lessons_count: lessonsCount || 0
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cursos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Buscar contagem de aulas para cada módulo
      const modulesWithCounts = await Promise.all(
        (data || []).map(async (module) => {
          const { count: lessonsCount } = await (supabase as any)
            .from('course_lessons')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', module.id);

          return {
            id: module.id,
            course_id: module.course_id || '',
            title: module.title,
            description: module.description || '',
            order_index: module.order_index,
            created_at: module.created_at,
            lessons_count: lessonsCount || 0
          };
        })
      );

      setModules(modulesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os módulos",
        variant: "destructive"
      });
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('course_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
        setLessons((data || []).map(lesson => ({
          ...lesson,
          content: lesson.description || '',
          is_completed: false,
          is_premium: !lesson.is_free
        })));
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aulas",
        variant: "destructive"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'doces':
        return <Gift className="h-4 w-4 text-pink-400" />;
      case 'exercicios':
        return <Dumbbell className="h-4 w-4 text-blue-400" />;
      case 'plataforma':
        return <Brain className="h-4 w-4 text-purple-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-green-400" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'doces':
        return 'Doces dos Sonhos';
      case 'exercicios':
        return 'Exercícios dos Sonhos';
      case 'plataforma':
        return 'Plataforma dos Sonhos';
      default:
        return category;
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      const { error } = await supabase
        .from('courses')
        .insert([courseData]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Curso criado com sucesso",
      });

      fetchCourses();
      fetchStats();
      setShowCourseModal(false);
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o curso",
        variant: "destructive"
      });
    }
  };

  const handleCreateModule = async (moduleData: any) => {
    try {
      // Converter o campo 'order' para 'order_index' que é o campo do banco
      const modulePayload = {
        ...moduleData,
        order_index: moduleData.order,
        order: undefined // Remove o campo 'order'
      };

      const { error } = await supabase
        .from('course_modules')
        .insert([modulePayload]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Módulo criado com sucesso",
      });

      if (selectedCourse) {
        fetchModules(selectedCourse.id);
      }
      fetchStats();
      setShowModuleModal(false);
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o módulo",
        variant: "destructive"
      });
    }
  };

  const handleCreateLesson = async (lessonData: any) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .insert([lessonData]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Aula criada com sucesso",
      });

      if (selectedModule) {
        fetchLessons(selectedModule.id);
      }
      fetchStats();
      setShowLessonModal(false);
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a aula",
        variant: "destructive"
      });
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedModule(null);
    setLessons([]);
    fetchModules(course.id);
    setActiveTab("modules");
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    fetchLessons(module.id);
    setActiveTab("lessons");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão de Cursos</h2>
          <p className="text-gray-400">Gerencie cursos, módulos, aulas e conteúdo da Plataforma dos Sonhos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Modo Admin Ativo
          </Badge>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open('/app/courses', '_blank')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Visualizar como Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
            <p className="text-xs text-gray-400">Cursos criados</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Módulos</CardTitle>
            <FileText className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalModules}</div>
            <p className="text-xs text-gray-400">Módulos organizados</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Aulas</CardTitle>
            <Video className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLessons}</div>
            <p className="text-xs text-gray-400">Aulas disponíveis</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Usuários</CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            <p className="text-xs text-gray-400">Usuários cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="modules" disabled={!selectedCourse}>
            <FileText className="h-4 w-4 mr-2" />
            Módulos {selectedCourse && `(${selectedCourse.title})`}
          </TabsTrigger>
          <TabsTrigger value="lessons" disabled={!selectedModule}>
            <Video className="h-4 w-4 mr-2" />
            Aulas {selectedModule && `(${selectedModule.title})`}
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cursos por Categoria */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Cursos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(course.category)}
                      <div>
                        <h4 className="font-semibold text-white">{course.title}</h4>
                        <p className="text-sm text-gray-400">{getCategoryName(course.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">{course.modules_count || 0} módulos</Badge>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCourseSelect(course)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    className="h-16 bg-blue-600 hover:bg-blue-700 flex items-center justify-start gap-4"
                    onClick={() => setShowCourseModal(true)}
                  >
                    <BookOpen className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Novo Curso</div>
                      <div className="text-sm opacity-80">Criar um novo curso na plataforma</div>
                    </div>
                  </Button>
                  
                  <Button 
                    className="h-16 bg-green-600 hover:bg-green-700 flex items-center justify-start gap-4"
                    onClick={() => setShowModuleModal(true)}
                    disabled={courses.length === 0}
                  >
                    <FileText className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Novo Módulo</div>
                      <div className="text-sm opacity-80">Adicionar módulo a um curso existente</div>
                    </div>
                  </Button>
                  
                  <Button 
                    className="h-16 bg-purple-600 hover:bg-purple-700 flex items-center justify-start gap-4"
                    onClick={() => setShowLessonModal(true)}
                    disabled={modules.length === 0}
                  >
                    <Video className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Nova Aula</div>
                      <div className="text-sm opacity-80">Criar uma nova aula em um módulo</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestão de Cursos */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Gestão de Cursos</h3>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCourseModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {getCategoryIcon(course.category)}
                      {course.title}
                    </CardTitle>
                    <Badge className={course.is_published ? 'bg-green-600' : 'bg-yellow-600'}>
                      {course.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{course.description}</p>
                  <Badge variant="outline" className="text-xs w-fit">
                    {getCategoryName(course.category)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">{course.modules_count || 0} módulos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">{course.lessons_count || 0} aulas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">{course.duration_minutes || 0}min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300">{course.is_premium ? 'Premium' : 'Gratuito'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleCourseSelect(course)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => window.open('/app/courses', '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Gestão de Módulos */}
        <TabsContent value="modules" className="space-y-6">
          {selectedCourse && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    {getCategoryIcon(selectedCourse.category)}
                    Módulos - {selectedCourse.title}
                  </h3>
                  <p className="text-gray-400">Gerencie os módulos deste curso</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedCourse(null);
                      setActiveTab("courses");
                    }}
                  >
                    ← Voltar aos Cursos
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowModuleModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Módulo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">📂 {module.title}</CardTitle>
                        <Badge className="bg-blue-600">{module.lessons_count || 0} aulas</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{module.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleModuleSelect(module)}
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Ver Aulas
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Gestão de Aulas */}
        <TabsContent value="lessons" className="space-y-6">
          {selectedModule && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">🎥 Aulas - {selectedModule.title}</h3>
                  <p className="text-gray-400">Gerencie as aulas deste módulo</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedModule(null);
                      setActiveTab("modules");
                    }}
                  >
                    ← Voltar aos Módulos
                  </Button>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowLessonModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                            {index + 1}
                          </span>
                          {lesson.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {lesson.is_premium && (
                            <Badge className="bg-yellow-600">Premium</Badge>
                          )}
                          <Badge variant="outline">{lesson.duration_minutes || 0}min</Badge>
                        </div>
                      </div>
                      {lesson.description && (
                        <p className="text-gray-400 text-sm">{lesson.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modais */}
      {showCourseModal && (
        <CourseModal 
          isOpen={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          onSubmit={handleCreateCourse}
        />
      )}
      {showModuleModal && (
        <ModuleModal 
          isOpen={showModuleModal}
          onClose={() => setShowModuleModal(false)}
          onSubmit={handleCreateModule}
          courses={courses.map(c => ({ id: c.id, title: c.title }))}
        />
      )}
      {showLessonModal && (
        <LessonModal 
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          onSubmit={handleCreateLesson}
          courses={courses.map(c => ({ id: c.id, title: c.title }))}
          modules={modules.map(m => ({ 
            id: m.id, 
            title: m.title, 
            courseId: m.course_id 
          }))}
        />
      )}
    </div>
  );
};