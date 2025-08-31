// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Users, 
  PlayCircle,
  FileText,
  BarChart3,
  Settings,
  Video,
  List,
  BookMarked,
  Clock,
  ArrowLeft,
  Star
} from 'lucide-react';
import { CourseModal } from './CourseModal';
import { ModuleModal } from './ModuleModal';
import { LessonModal } from './LessonModal';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  instructor_name: string;
  is_premium: boolean;
  is_published: boolean;
  thumbnail_url?: string;
  price?: number;
  structure_type: 'course_lesson' | 'course_module_lesson';
  created_at: string;
  modules_count?: number;
  lessons_count?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  lessons_count?: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  module_id: string;
  order_index: number;
  duration_minutes: number;
  video_url?: string;
  is_free: boolean;
  created_at: string;
}

interface Stats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalStudents: number;
}

export const CourseManagementNew = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'modules' | 'lessons'>('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  
  // Estados de modais
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  
  // Estados de edição
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // Estados de carregamento
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, []);

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      const { count: modulesCount } = await supabase
        .from('course_modules')
        .select('*', { count: 'exact', head: true });

      const { count: lessonsCount } = await supabase
        .from('lessons')
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

  // Buscar cursos
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar contagem de módulos e aulas para cada curso
      const coursesWithCounts = await Promise.all(
        (data || []).map(async (courseData: any) => {
          const course = courseData as Course;
          const { data: modulesData } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', course.id);

          const moduleIds = modulesData?.map(m => m.id) || [];
          let lessonsCount = 0;

          if (moduleIds.length > 0) {
            const { count } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true })
              .in('module_id', moduleIds);
            lessonsCount = count || 0;
          }

          return {
            ...course,
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

  // Buscar módulos de um curso
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
        (data || []).map(async (module: Module) => {
          const { count: lessonsCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', module.id);

          return {
            ...module,
            lessons_count: lessonsCount || 0,
            courseId: module.course_id // Adicionar mapeamento para compatibilidade com LessonModal
          };
        })
      );

      setModules(modulesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
    }
  };

  // Buscar aulas de um módulo
  const fetchLessons = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, module_id, order_index, duration_minutes, video_url, created_at')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data?.map(lesson => ({
        ...lesson,
        description: '', // Default description since it doesn't exist in DB
        is_free: true // Default to free
      })) || []);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
    }
  };

  // Handlers de criação
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
      // Converter o campo 'order_index' e remover campos que não existem no banco
      const { order, structure_type, ...modulePayload } = moduleData;
      
      const finalPayload = {
        ...modulePayload,
        order_index: moduleData.order_index || 1,
      };

      const { error } = await supabase
        .from('course_modules')
        .insert([finalPayload]);

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
      // Mapear campos para a estrutura correta do banco
      const lessonToInsert = {
        title: lessonData.title,
        description: lessonData.description || "Aula criada automaticamente",
        video_url: lessonData.videoUrl || "",
        thumbnail_url: (lessonData as any).thumbnailUrl || undefined,
        content: lessonData.richTextContent || lessonData.mixedContent || "",
        duration_minutes: lessonData.duration || 0,
        order_index: lessonData.order || 1,
        is_free: !lessonData.isActive ? false : true,
        module_id: lessonData.moduleId,
        course_id: lessonData.courseId
      };

      const { error } = await supabase
        .from('lessons')
        .insert([lessonToInsert]);

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

  // Handlers de seleção
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

  // Utilitários
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  // Verificar se é super admin
  const checkSuperAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, admin_level')
      .eq('user_id', user.id)
      .single();

    console.log('Admin check for lesson creation disabled');
  };

  // Handlers de edição
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setShowModuleModal(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowLessonModal(true);
  };

  // Handlers de exclusão (apenas super admin)
  const handleDeleteCourse = async (courseId: string) => {
    const isSuperAdmin = await checkSuperAdmin();
    if (!isSuperAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas Super Admins podem excluir cursos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Curso Excluído ✅",
        description: "Curso foi permanentemente removido"
      });

      fetchCourses();
      fetchStats();
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o curso",
        variant: "destructive"
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    const isSuperAdmin = await checkSuperAdmin();
    if (!isSuperAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas Super Admins podem excluir módulos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Módulo Excluído ✅",
        description: "Módulo foi permanentemente removido"
      });

      if (selectedCourse) {
        fetchModules(selectedCourse.id);
      }
      fetchStats();
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o módulo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const isSuperAdmin = await checkSuperAdmin();
    if (!isSuperAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas Super Admins podem excluir aulas",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Aula Excluída ✅",
        description: "Aula foi permanentemente removida"
      });

      if (selectedModule) {
        fetchLessons(selectedModule.id);
      }
      fetchStats();
    } catch (error) {
      console.error('Erro ao excluir aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a aula",
        variant: "destructive"
      });
    }
  };

  // Handlers de atualização
  const handleUpdateCourse = async (courseData: any) => {
    if (!editingCourse) return;

    try {
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', editingCourse.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Curso atualizado com sucesso",
      });

      fetchCourses();
      fetchStats();
      setShowCourseModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o curso",
        variant: "destructive"
      });
    }
  };

  const handleUpdateModule = async (moduleData: any) => {
    if (!editingModule) return;

    try {
      const { order, structure_type, ...modulePayload } = moduleData;
      
      const finalPayload = {
        ...modulePayload,
        order_index: moduleData.order_index || editingModule.order_index,
      };

      const { error } = await supabase
        .from('course_modules')
        .update(finalPayload)
        .eq('id', editingModule.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Módulo atualizado com sucesso",
      });

      if (selectedCourse) {
        fetchModules(selectedCourse.id);
      }
      fetchStats();
      setShowModuleModal(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o módulo",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLesson = async (lessonData: any) => {
    if (!editingLesson) return;

    try {
      const lessonToUpdate = {
        title: lessonData.title,
        description: lessonData.description || editingLesson.description,
        video_url: lessonData.videoUrl || editingLesson.video_url,
        thumbnail_url: (lessonData as any).thumbnailUrl,
        content: lessonData.richTextContent || lessonData.mixedContent || "",
        duration_minutes: lessonData.duration || editingLesson.duration_minutes,
        order_index: lessonData.order || editingLesson.order_index,
        is_free: lessonData.isActive !== undefined ? lessonData.isActive : editingLesson.is_free,
      };

      const { error } = await supabase
        .from('lessons')
        .update(lessonToUpdate)
        .eq('id', editingLesson.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Aula atualizada com sucesso",
      });

      if (selectedModule) {
        fetchLessons(selectedModule.id);
      }
      fetchStats();
      setShowLessonModal(false);
      setEditingLesson(null);
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a aula",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total de Cursos</p>
                <p className="text-3xl font-bold">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total de Módulos</p>
                <p className="text-3xl font-bold">{stats.totalModules}</p>
              </div>
              <BookMarked className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total de Aulas</p>
                <p className="text-3xl font-bold">{stats.totalLessons}</p>
              </div>
              <Video className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Estudantes</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegação por breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setActiveTab("overview");
            setSelectedCourse(null);
            setSelectedModule(null);
          }}
          className="hover:text-foreground"
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Visão Geral
        </Button>
        {selectedCourse && (
          <>
            <span>/</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setActiveTab("modules");
                setSelectedModule(null);
              }}
              className="hover:text-foreground"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              {selectedCourse.title}
            </Button>
          </>
        )}
        {selectedModule && (
          <>
            <span>/</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveTab("lessons")}
              className="hover:text-foreground"
            >
              <List className="h-4 w-4 mr-1" />
              {selectedModule.title}
            </Button>
          </>
        )}
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            VISÃO GERAL
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            CURSOS
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2" disabled={!selectedCourse}>
            <BookMarked className="h-4 w-4" />
            MÓDULOS
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2" disabled={!selectedModule}>
            <Video className="h-4 w-4" />
            AULAS
          </TabsTrigger>
        </TabsList>

        {/* TAB: VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowCourseModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Curso
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowModuleModal(true)}
                  disabled={courses.length === 0}
                >
                  <BookMarked className="h-4 w-4 mr-2" />
                  Novo Módulo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowLessonModal(true)}
                  disabled={modules.length === 0}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Nova Aula
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cursos Publicados:</span>
                    <span className="font-semibold">{courses.filter(c => c.is_published).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rascunhos:</span>
                    <span className="font-semibold">{courses.filter(c => !c.is_published).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cursos Premium:</span>
                    <span className="font-semibold">{courses.filter(c => c.is_premium).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Últimos Cursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="text-sm">
                      <div className="font-medium truncate">{course.title}</div>
                      <div className="text-muted-foreground text-xs">{course.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: CURSOS */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">📚 Gestão de Cursos</h3>
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
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    {course.thumbnail_url && (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>
                  
                  {/* Badges de informação */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                      {getDifficultyLabel(course.difficulty_level)}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {course.category}
                    </Badge>
                    {course.is_premium && (
                      <Badge className="bg-yellow-500 text-black">Premium</Badge>
                    )}
                    {!course.is_published && (
                      <Badge variant="outline" className="text-red-600 border-red-600">Rascunho</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Estatísticas do curso */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4" />
                      <span>{course.modules_count || 0} módulos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>{course.lessons_count || 0} aulas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_minutes}min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course.instructor_name}</span>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCourseSelect(course)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gerenciar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: MÓDULOS */}
        <TabsContent value="modules" className="space-y-6">
          {selectedCourse && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">📚 Módulos do Curso: {selectedCourse.title}</h3>
                  <p className="text-muted-foreground">Organize o conteúdo em módulos</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedCourse(null);
                      setActiveTab("courses");
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Video className="h-4 w-4" />
                          <span>{module.lessons_count || 0} aulas</span>
                        </div>
                        <Badge variant={module.is_active ? "default" : "secondary"}>
                          {module.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModuleSelect(module)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Gerenciar Aulas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditModule(module)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* TAB: AULAS */}
        <TabsContent value="lessons" className="space-y-6">
          {selectedModule && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">🎥 Aulas do Módulo: {selectedModule.title}</h3>
                  <p className="text-muted-foreground">Gerencie o conteúdo das aulas</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedModule(null);
                      setActiveTab("modules");
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <CardDescription>{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration_minutes}min</span>
                        </div>
                        <Badge variant={lesson.is_free ? "secondary" : "default"}>
                          {lesson.is_free ? "Gratuita" : "Premium"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditLesson(lesson)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
      />

      <ModuleModal
        isOpen={showModuleModal}
        onClose={() => {
          setShowModuleModal(false);
          setEditingModule(null);
        }}
        onSubmit={editingModule ? handleUpdateModule : handleCreateModule}
        courses={courses}
      />

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setEditingLesson(null);
        }}
        onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}
        courses={courses}
        modules={modules}
      />
    </div>
  );
};