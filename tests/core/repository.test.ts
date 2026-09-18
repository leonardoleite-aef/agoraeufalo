import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AEFAccessEngine = require("../../assets/js/aef-access-engine.js");
const { CourseRepository, UserRepository, AEFCloudSync, aefCloudSync } = require("../../assets/js/aef-cloud-sync.js");


describe("Suite de Testes da Camada de Repositório (Fase 4 - Etapa 4.1)", () => {
  let capturedWarns: string[] = [];
  const originalWarn = console.warn;

  beforeEach(() => {
    capturedWarns = [];
    console.warn = (...args: any[]) => {
      capturedWarns.push(args.join(" "));
      originalWarn(...args);
    };
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  describe("CourseRepository — Prioridade Determinística & Normalização V2", () => {
    test("Prioridade 1: Deve retornar dados remotos quando disponíveis via SDK Firestore", async () => {
      const mockDb = {
        collection: (col: string) => ({
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              id: "curso-remoto-1",
              data: () => ({
                title: "Curso Remoto Oficial",
                published: true,
                accessTier: "all_access",
                modulesCount: 2
              })
            }),
            collection: (subCol: string) => ({
              get: async () => ({
                empty: false,
                docs: [
                  {
                    id: "mod-1",
                    data: () => ({ title: "Módulo 1 Remoto", order: 1 })
                  }
                ]
              }),
              doc: (subId: string) => ({
                collection: (nestedSub: string) => ({
                  get: async () => ({
                    empty: false,
                    docs: [
                      {
                        id: "lesson-1",
                        data: () => ({ title: "Aula 1 Remota", order: 1 })
                      }
                    ]
                  })
                })
              })
            })
          })
        })
      };

      const mockSync = {
        init: async () => {},
        db: mockDb
      };

      const repo = new CourseRepository(mockSync);
      const baseRegistry = {
        "curso-remoto-1": {
          id: "curso-remoto-1",
          title: "Versão Local Obsoleta",
          modules: []
        }
      };

      const result = await repo.getCourseHierarchy("curso-remoto-1", baseRegistry);

      assert.equal(result.id, "curso-remoto-1");
      assert.equal(result.title, "Curso Remoto Oficial");
      assert.equal(result.modules.length, 1);
      assert.equal(result.modules[0].title, "Módulo 1 Remoto");
      // Validação de contrato V2
      assert.equal(result.schemaVersion, 2);
      assert.ok(result.access);
      assert.ok(Array.isArray(result.access.entitlements));

      // Nenhuma advertência de fallback deve ter sido emitida
      const fallbackWarn = capturedWarns.find(w => w.includes("[AEF Repository] Usando dados locais de fallback"));
      assert.equal(fallbackWarn, undefined, "Não deve acionar fallback quando remoto for bem-sucedido");
    });

    test("Fallback 2: Deve acionar fallback local e emitir console.warn explícito quando remoto falhar", async () => {
      const mockSyncFailing = {
        init: async () => {},
        db: {
          collection: () => {
            throw new Error("Conexão Firestore indisponível");
          }
        }
      };

      // Mock global fetch simulando falha de rede/REST
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        throw new Error("Network offline");
      };

      try {
        const repo = new CourseRepository(mockSyncFailing);
        const baseRegistry = {
          "curso-fallback-1": {
            id: "curso-fallback-1",
            title: "Curso Fallback Local",
            accessTier: "free",
            modules: [
              { id: "mod-local", title: "Módulo Local", lessons: [] }
            ]
          }
        };

        const result = await repo.getCourseHierarchy("curso-fallback-1", baseRegistry);

        assert.equal(result.id, "curso-fallback-1");
        assert.equal(result.title, "Curso Fallback Local");
        assert.equal(result.schemaVersion, 2);
        assert.ok(result.access);
        assert.ok(result.access.entitlements.includes("member_free"));

        // Validação estrita do fim do merge silencioso: warning explícito
        const hasWarning = capturedWarns.some(w =>
          w.includes('[AEF Repository] Usando dados locais de fallback para: curso "curso-fallback-1"')
        );
        assert.ok(hasWarning, "Deve emitir console.warn padronizado ao usar dados de fallback");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    test("getCoursesList deve retornar lista normalizada V2 e alertar sobre fallback em indisponibilidade remota", async () => {
      const mockSyncFailing = {
        init: async () => {},
        db: null
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        throw new Error("REST indisponível");
      };

      try {
        const repo = new CourseRepository(mockSyncFailing);
        const baseRegistry = {
          "c1": { id: "c1", title: "Curso 1", accessTier: "all_access" },
          "c2": { id: "c2", title: "Curso 2", accessTier: "standalone" }
        };

        const list = await repo.getCoursesList(baseRegistry);

        assert.ok(list["c1"]);
        assert.ok(list["c2"]);
        assert.equal(list["c1"].schemaVersion, 2);
        assert.equal(list["c2"].access.requiresProductId[0], "c2");

        const warnFound = capturedWarns.some(w =>
          w.includes("[AEF Repository] Usando dados locais de fallback para: catálogo de cursos")
        );
        assert.ok(warnFound, "Deve avisar que a listagem de cursos usou fallback local");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("UserRepository — Resolução de Perfil & Normalização V2", () => {
    test("Prioridade 1: Deve obter perfil remoto do Firestore e normalizar para V2", async () => {
      const mockDb = {
        collection: (col: string) => ({
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              id: "aluno-123",
              data: () => ({
                name: "Aluno Remoto Teste",
                email: "aluno@teste.com",
                role: "student",
                tier: "magic_stories_club",
                subscriptions: [
                  {
                    id: "sub-1",
                    entitlement: "member_pago",
                    status: "active",
                    tier: "club_anual",
                    startedAt: "2026-01-01T00:00:00.000Z"
                  }
                ]
              })
            })
          })
        })
      };

      const mockSync = {
        init: async () => {},
        db: mockDb
      };

      const userRepo = new UserRepository(mockSync);
      const user = await userRepo.getUser("aluno-123");

      assert.ok(user);
      assert.equal(user.id, "aluno-123");
      assert.equal(user.schemaVersion, 2);
      assert.equal(user.email, "aluno@teste.com");
      assert.equal(user.role, "student");
      assert.equal(user.subscriptions.length, 1);
      assert.equal(user.subscriptions[0].status, "active");
    });

    test("Fallback 2: Deve buscar cache local com advertência explícita caso remoto falhe", async () => {
      const mockSyncFailing = {
        init: async () => {},
        db: {
          collection: () => {
            throw new Error("Firestore down");
          }
        }
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        throw new Error("REST down");
      };

      // Mock localStorage global
      const mockStorage: Record<string, string> = {
        "aef_user_cache_aluno-offline": JSON.stringify({
          id: "aluno-offline",
          name: "Aluno Offline Cache",
          email: "offline@teste.com",
          tier: "free"
        })
      };
      (globalThis as any).localStorage = {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, val: string) => { mockStorage[key] = val; }
      };

      try {
        const userRepo = new UserRepository(mockSyncFailing);
        const user = await userRepo.getUser("aluno-offline");

        assert.ok(user);
        assert.equal(user.id, "aluno-offline");
        assert.equal(user.name, "Aluno Offline Cache");
        assert.equal(user.schemaVersion, 2);

        const warnFound = capturedWarns.some(w =>
          w.includes('[AEF Repository] Usando dados locais de fallback para: perfil do usuário "aluno-offline"')
        );
        assert.ok(warnFound, "Deve registrar aviso explícito de uso de fallback para perfil de usuário");
      } finally {
        globalThis.fetch = originalFetch;
        delete (globalThis as any).localStorage;
      }
    });
  });

  describe("AEFCloudSync Singleton & Delegação Sem Quebras", () => {
    test("aefCloudSync deve delegar chamadas para courseRepository e userRepository preservando contratos", async () => {
      assert.ok(aefCloudSync.courseRepository instanceof CourseRepository);
      assert.ok(aefCloudSync.userRepository instanceof UserRepository);

      // Verificação das assinaturas dos métodos de compatibilidade
      assert.equal(typeof aefCloudSync.getCourseHierarchy, "function");
      assert.equal(typeof aefCloudSync.getCoursesList, "function");
      assert.equal(typeof aefCloudSync.getCoursesHierarchy, "function");
      assert.equal(typeof aefCloudSync.saveCourse, "function");
      assert.equal(typeof aefCloudSync.getCoursesMetadata, "function");
      assert.equal(typeof aefCloudSync.hydrateCourse, "function");
      assert.equal(typeof aefCloudSync.hydrateLesson, "function");
      assert.equal(typeof aefCloudSync.saveModule, "function");
      assert.equal(typeof aefCloudSync.saveLesson, "function");
      assert.equal(typeof aefCloudSync.deleteModuleFromCloud, "function");
      assert.equal(typeof aefCloudSync.deleteLessonFromCloud, "function");
      assert.equal(typeof aefCloudSync.getUser, "function");
      assert.equal(typeof aefCloudSync.getUserProfile, "function");
      assert.equal(typeof aefCloudSync.getAllUsers, "function");
      assert.equal(typeof aefCloudSync.getAllStudentsAndMentees, "function");
      assert.equal(typeof aefCloudSync.saveUser, "function");
    });
  });

  describe("Otimização de Catálogo e Desacoplamento de Carregamento (Etapa 4.2)", () => {
    test("AEF_COURSES_METADATA deve expor apenas metadados leves com contrato V2", () => {
      const coursesMeta = require("../../assets/js/aef-courses-metadata.js");
      assert.ok(coursesMeta["dtc_curso"]);
      assert.ok(coursesMeta["english-quickstart"]);
      assert.ok(coursesMeta["ms-legacy"]);

      // Verifica campos essenciais
      const dtc = coursesMeta["dtc_curso"];
      assert.equal(dtc.id, "dtc_curso");
      assert.equal(dtc.schemaVersion, 2);
      assert.ok(dtc.access);
      assert.ok(Array.isArray(dtc.access.entitlements));
      assert.equal(dtc.modulesCount, 4);
      assert.equal(dtc.lessonsCount, 7);

      // Metadados leves não devem carregar o array pesado de lições
      assert.equal(dtc.modules, undefined);
    });

    test("AEF_COURSES_REGISTRY deve manter retrocompatibilidade e permitir hidratação de módulos sob demanda", () => {
      const registry = require("../../assets/js/aef-courses-registry.js");
      assert.ok(registry["dtc_curso"]);
      assert.ok(Array.isArray(registry["dtc_curso"].modules));
      assert.equal(registry["dtc_curso"].modules.length, 4);

      // Confirma que a primeira lição de DTC possui todos os dados ricos
      const firstLesson = registry["dtc_curso"].modules[0].lessons[0];
      assert.ok(firstLesson.videoUrl);
      assert.ok(firstLesson.goldenTip);
      assert.ok(firstLesson.processedContentHtml);

      // Função de hidratação sob demanda exportada
      assert.equal(typeof registry.hydrateCourseModules, "function");
      const hydrated = registry.hydrateCourseModules("dtc_curso");
      assert.equal(hydrated.length, 4);
    });

    test("getCoursesMetadata deve retornar catálogo leve normalizado V2 com modules: []", async () => {
      const mockSync = {
        init: async () => {},
        db: null
      };
      const repo = new CourseRepository(mockSync);
      const meta = await repo.getCoursesMetadata();

      assert.ok(meta["dtc_curso"]);
      assert.equal(meta["dtc_curso"].schemaVersion, 2);
      assert.deepEqual(meta["dtc_curso"].modules, []);
      assert.ok(meta["dtc_curso"].access);
    });

    test("hydrateCourse e hydrateLesson devem resolver a árvore sob demanda no CourseRepository", async () => {
      const mockDb = {
        collection: (col: string) => ({
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              id: "curso-on-demand",
              data: () => ({ title: "Curso On Demand", accessTier: "free" })
            }),
            collection: (subCol: string) => ({
              get: async () => ({
                empty: false,
                docs: [
                  {
                    id: "mod-on-demand",
                    data: () => ({ title: "Módulo On Demand", order: 1 })
                  }
                ]
              }),
              doc: (subId: string) => ({
                collection: (nestedSub: string) => ({
                  get: async () => ({
                    empty: false,
                    docs: [
                      {
                        id: "lesson-on-demand",
                        data: () => ({
                          title: "Aula On Demand",
                          order: 1,
                          videoUrl: "https://video.mp4",
                          goldenTip: "Sacada de Ouro"
                        })
                      }
                    ]
                  })
                })
              })
            })
          })
        })
      };

      const mockSync = {
        init: async () => {},
        db: mockDb
      };

      const repo = new CourseRepository(mockSync);

      // 1. hydrateCourse
      const hydratedCourse = await repo.hydrateCourse("curso-on-demand");
      assert.equal(hydratedCourse.id, "curso-on-demand");
      assert.equal(hydratedCourse.modules.length, 1);
      assert.equal(hydratedCourse.modules[0].lessons.length, 1);

      // 2. hydrateLesson
      const hydratedLesson = await repo.hydrateLesson("curso-on-demand", "mod-on-demand", "lesson-on-demand");
      assert.ok(hydratedLesson);
      assert.equal(hydratedLesson.id, "lesson-on-demand");
      assert.equal(hydratedLesson.goldenTip, "Sacada de Ouro");
      assert.equal(hydratedLesson.videoUrl, "https://video.mp4");
    });
  });
});

