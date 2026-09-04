/**
 * AgoraEuFalo - Learning Tracker & Activity Memory
 * Professor Leonardo Leite
 * 
 * Gerencia a continuidade do aluno no ecossistema:
 * 1. Última atividade global (Onde você parou).
 * 2. Progresso independente por curso (última aula e lista de concluídas).
 * 3. Rastreamento unificado de tempo de escuta (Listening Time) e ofensiva (Streak) Desktop + Mobile.
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    GLOBAL_LAST_ACTIVITY: 'aef_last_activity',
    COURSE_PROGRESS_PREFIX: 'aef_course_progress_',
    COMPLETED_LESSONS: 'aef_completed_lessons',
    LISTENING_STATS_PREFIX: 'aef_listening_stats_'
  };

  class AEFLearningTracker {
    constructor() {
      this._subscribers = [];
    }

    /**
     * Retorna a última atividade de estudo do aluno
     */
    getGlobalLastActivity() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_LAST_ACTIVITY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn('[AEF Tracker] Erro ao ler última atividade:', e);
        return null;
      }
    }

    /**
     * Salva a última atividade em qualquer interface (Sala de Aula ou Player)
     */
    saveLastActivity({ courseId, courseTitle, moduleId, moduleTitle, lessonId, lessonTitle, lessonDuration, thumbnailUrl, source = 'classroom' }) {
      if (!courseId) return;

      const activity = {
        courseId,
        courseTitle: courseTitle || courseId,
        moduleId: moduleId || '',
        moduleTitle: moduleTitle || '',
        lessonId: lessonId || '',
        lessonTitle: lessonTitle || '',
        lessonDuration: lessonDuration || '',
        thumbnailUrl: thumbnailUrl || 'assets/images/cover-default-aef.jpg',
        source, // 'classroom' | 'player'
        timestamp: Date.now()
      };

      try {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_LAST_ACTIVITY, JSON.stringify(activity));
        this.saveCourseProgress(courseId, moduleId, lessonId);
        this._notify();
      } catch (e) {
        console.warn('[AEF Tracker] Erro ao salvar última atividade:', e);
      }
      return activity;
    }

    /**
     * Obtém o progresso de um curso específico
     */
    getCourseProgress(courseId) {
      if (!courseId) return null;
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.COURSE_PROGRESS_PREFIX + courseId);
        const data = raw ? JSON.parse(raw) : {};
        
        // Garante leitura de aulas concluídas globais
        const completedGlobal = this.getCompletedLessons();
        const courseCompleted = (data.completedLessons || []).filter(id => completedGlobal.includes(id));

        return {
          courseId,
          lastModuleId: data.lastModuleId || '',
          lastLessonId: data.lastLessonId || '',
          completedLessons: Array.from(new Set([...(data.completedLessons || []), ...courseCompleted])),
          lastAccessedAt: data.lastAccessedAt || 0
        };
      } catch (e) {
        return { courseId, lastModuleId: '', lastLessonId: '', completedLessons: [], lastAccessedAt: 0 };
      }
    }

    /**
     * Salva o progresso de um curso específico
     */
    saveCourseProgress(courseId, moduleId, lessonId) {
      if (!courseId) return;
      try {
        const current = this.getCourseProgress(courseId);
        const updated = {
          ...current,
          courseId,
          lastModuleId: moduleId || current.lastModuleId,
          lastLessonId: lessonId || current.lastLessonId,
          lastAccessedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS_PREFIX + courseId, JSON.stringify(updated));
      } catch (e) {
        console.warn('[AEF Tracker] Erro ao salvar progresso do curso:', e);
      }
    }

    /**
     * Retorna todas as aulas marcadas como concluídas
     */
    getCompletedLessons() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    /**
     * Alterna status de conclusão de uma aula
     */
    toggleLessonCompleted(courseId, lessonId) {
      if (!lessonId) return false;
      try {
        let list = this.getCompletedLessons();
        const exists = list.includes(lessonId);
        if (exists) {
          list = list.filter(id => id !== lessonId);
        } else {
          list.push(lessonId);
        }
        localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(list));

        if (courseId) {
          const prog = this.getCourseProgress(courseId);
          let cList = prog.completedLessons || [];
          if (exists) {
            cList = cList.filter(id => id !== lessonId);
          } else if (!cList.includes(lessonId)) {
            cList.push(lessonId);
          }
          prog.completedLessons = cList;
          localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS_PREFIX + courseId, JSON.stringify(prog));
        }

        this._notify();
        return !exists;
      } catch (e) {
        return false;
      }
    }

    /**
     * Adiciona segundos de escuta ativa (Listening Time) e atualiza streak
     */
    recordListeningTime(studentId = 'public', seconds = 0) {
      if (!seconds || seconds <= 0) return;
      studentId = (studentId || 'public').toLowerCase().trim();
      const storageKey = STORAGE_KEYS.LISTENING_STATS_PREFIX + studentId;
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      let stats = {
        todaySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        totalSeconds: 0,
        lastTrainedDate: todayStr,
        streakDays: 1,
        updatedAt: now.toISOString()
      };

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lastTrainedDate === todayStr) {
            stats.todaySeconds = (parsed.todaySeconds || 0) + seconds;
            stats.weekSeconds = (parsed.weekSeconds || 0) + seconds;
            stats.monthSeconds = (parsed.monthSeconds || 0) + seconds;
            stats.totalSeconds = (parsed.totalSeconds || 0) + seconds;
            stats.streakDays = parsed.streakDays || 1;
          } else {
            const prevDate = new Date(parsed.lastTrainedDate || 0);
            const diffDays = Math.round((now - prevDate) / (1000 * 60 * 60 * 24));
            stats.todaySeconds = seconds;
            stats.weekSeconds = (diffDays <= 7 ? (parsed.weekSeconds || 0) : 0) + seconds;
            stats.monthSeconds = (diffDays <= 30 ? (parsed.monthSeconds || 0) : 0) + seconds;
            stats.totalSeconds = (parsed.totalSeconds || 0) + seconds;
            stats.streakDays = diffDays === 1 ? (parsed.streakDays || 0) + 1 : 1;
          }
        } else {
          stats.todaySeconds = seconds;
          stats.weekSeconds = seconds;
          stats.monthSeconds = seconds;
          stats.totalSeconds = seconds;
          stats.streakDays = 1;
        }
        localStorage.setItem(storageKey, JSON.stringify(stats));
      } catch (e) {
        console.warn('[AEF Tracker] Erro ao salvar listening stats:', e);
      }

      // Sincroniza em nuvem via aefCloudSync se disponível
      if (window.aefCloudSync && typeof window.aefCloudSync.recordListeningSession === 'function') {
        window.aefCloudSync.recordListeningSession(studentId, seconds).catch(() => {});
      }
    }

    /**
     * Retorna as estatísticas consolidadas de listening e streak
     */
    getListeningStats(studentId = 'public') {
      studentId = (studentId || 'public').toLowerCase().trim();
      const storageKey = STORAGE_KEYS.LISTENING_STATS_PREFIX + studentId;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {
        todaySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        totalSeconds: 0,
        lastTrainedDate: new Date().toISOString().split('T')[0],
        streakDays: 1
      };
    }

    _notify() {
      try {
        window.dispatchEvent(new CustomEvent('aef:learning-activity-changed'));
      } catch (e) {}
    }
  }

  window.aefLearningTracker = new AEFLearningTracker();
})(window);
