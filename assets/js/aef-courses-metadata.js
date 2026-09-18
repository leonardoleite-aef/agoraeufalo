/**
 * AgoraEuFalo - Lightweight Courses Catalog Metadata
 * Professor Leonardo Leite
 * 
 * Contrato V2: Metadados essenciais de cursos para renderização rápida de catálogos,
 * vitrines, cards e dropdowns sem necessidade de carregar a árvore pesada de módulos e lições.
 */

(function (root) {
  "use strict";

  const AEF_COURSES_METADATA = {
    "dtc_curso": {
      "id": "dtc_curso",
      "title": "Dates and Times - Curso Rápido",
      "slug": "dtc_curso",
      "badge": "EXPERIMENTE GRÁTIS",
      "accessTier": "free",
      "categories": [
        "foundations"
      ],
      "themeColor": "ruby",
      "coverImageUrl": "assets/images/cover-dates-and-times-square.jpg",
      "description": "Aprenda tudo sobre datas, horas, uso de tempo e períodos em inglês. Um curso rápido que definitivamente vai te deixar pronto para escutar, entender e expresar tudo sobre datas, dias, horas, calendários e períodos de tempo em Inglês.",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_free",
          "member_pago"
        ],
        "requiresProductId": [],
        "legacyGrantIds": []
      },
      "modulesCount": 4,
      "lessonsCount": 7
    },
    "english-quickstart": {
      "id": "english-quickstart",
      "title": "English QuickStart • Fundamentos da Fala",
      "slug": "english-quickstart",
      "badge": "EXCLUSIVO CLUB",
      "accessTier": "all_access",
      "categories": [
        "foundations"
      ],
      "coverImageUrl": "assets/images/cover-english-quickstart.jpg?v=20260905",
      "description": "",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_pago"
        ],
        "requiresProductId": [],
        "legacyGrantIds": []
      },
      "modulesCount": 2,
      "lessonsCount": 5
    },
    "ms-legacy": {
      "id": "ms-legacy",
      "title": "Magic Stories Legacy • O Acervo Clássico",
      "slug": "ms-legacy",
      "badge": "LEGACY CLUB",
      "accessTier": "all_access",
      "categories": [
        "magic_stories"
      ],
      "coverImageUrl": "assets/images/cover-magic-stories-cinema.jpg?v=20260905",
      "description": "O acervo histórico das 30 histórias clássicas do Método Magic Stories, com áudios narrados originais, quebra em chunks, treinos de reflexo e apostilas em PDF.",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_pago"
        ],
        "requiresProductId": [],
        "legacyGrantIds": []
      },
      "modulesCount": 30,
      "lessonsCount": 190
    },
    "mentoria-andre": {
      "id": "mentoria-andre",
      "title": "Mentoria VIP • André Barrote",
      "slug": "mentoria-andre",
      "badge": "MENTORIA VIP",
      "studentId": "andre",
      "studentEmail": "andrebarrote1992@gmail.com",
      "accessTier": "mentoria_vip",
      "categories": [
        "real_english"
      ],
      "themeColor": "emerald",
      "coverImageUrl": "assets/images/cover-andre-barrote.jpg",
      "description": "Espaço individual de mentoria executiva e imersão acelerada com o Professor Leonardo Leite.",
      "meetUrl": "https://meet.google.com/pcn-wgxm-tma",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_mentoria"
        ],
        "requiresProductId": [
          "mentoria-andre",
          "PROJETO_AEF_2026",
          "MENTORIA_VIP"
        ],
        "legacyGrantIds": []
      },
      "modulesCount": 1,
      "lessonsCount": 1
    },
    "mentoria-thomasskt21": {
      "id": "mentoria-thomasskt21",
      "title": "Mentoria VIP • Thomas Henrique Silva",
      "slug": "mentoria-thomasskt21",
      "badge": "MENTORIA VIP",
      "studentId": "thomasskt21",
      "studentEmail": "thomasskt21@gmail.com",
      "accessTier": "mentoria_vip",
      "categories": [
        "real_english"
      ],
      "themeColor": "emerald",
      "coverImageUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/covers%2Fmentoria%2F1789198485748_thomas_image.jpeg?alt=media",
      "description": "Espaço individual de mentoria executiva e imersão acelerada de Thomas Henrique Silva com o Professor Leonardo Leite.",
      "meetUrl": "https://meet.google.com/uyj-dfzg-pmh",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_mentoria"
        ],
        "requiresProductId": [
          "mentoria-thomasskt21",
          "PROJETO_AEF_2026",
          "MENTORIA_VIP"
        ],
        "legacyGrantIds": []
      },
      "modulesCount": 1,
      "lessonsCount": 2
    },
    "mentoria-mateus.s.gomes.novo": {
      "id": "mentoria-mateus.s.gomes.novo",
      "title": "Mentoria VIP • Mateus Gomes",
      "slug": "mentoria-mateus.s.gomes.novo",
      "badge": "MENTORIA VIP",
      "studentId": "mateus.s.gomes.novo",
      "studentEmail": "mateus.s.gomes.novo@gmail.com",
      "accessTier": "mentoria_vip",
      "categories": [
        "real_english"
      ],
      "themeColor": "emerald",
      "coverImageUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/courses%2Fcovers%2F1789245580830_mateus.jpeg?alt=media",
      "description": "Espaço individual de mentoria executiva e imersão acelerada de Mateus Gomes com o Professor Leonardo Leite.",
      "meetUrl": "https://meet.google.com/kmu-hwdu-xrm",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_mentoria"
        ],
        "requiresProductId": [
          "mentoria-mateus.s.gomes.novo",
          "PROJETO_AEF_2026",
          "MENTORIA_VIP"
        ],
        "legacyGrantIds": []
      },
      "modulesCount": 1,
      "lessonsCount": 1
    },
    "mentoria-estevaopin": {
      "id": "mentoria-estevaopin",
      "title": "Mentoria VIP • Estêvão Pinheiro",
      "slug": "mentoria-estevaopin",
      "badge": "MENTORIA VIP",
      "studentId": "estevaopin",
      "studentEmail": "estevaopin@gmail.com",
      "accessTier": "mentoria_vip",
      "categories": [
        "real_english"
      ],
      "themeColor": "emerald",
      "coverImageUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/covers%2Fmentoria%2F1789395193562_estevao_img.jpeg?alt=media",
      "description": "Espaço individual de mentoria executiva e imersão acelerada de Estêvão Pinheiro com o Professor Leonardo Leite.",
      "meetUrl": "https://meet.google.com/bbr-kzuy-edc",
      "published": true,
      "schemaVersion": 2,
      "access": {
        "entitlements": [
          "member_mentoria"
        ],
        "requiresProductId": [
          "mentoria-estevaopin",
          "PROJETO_AEF_2026",
          "MENTORIA_VIP"
        ],
        "legacyGrantIds": []
      },
      "modulesCount": 1,
      "lessonsCount": 1
    }
  };

  const MENTORIA_CANONICAL_ALIASES = {
    "mentoria-thomas": "mentoria-thomasskt21",
    "mentoria-mateus": "mentoria-mateus.s.gomes.novo",
    "mentoria-matheus": "mentoria-mateus.s.gomes.novo",
    "mentoria-estevao": "mentoria-estevaopin"
  };

  for (const [alias, target] of Object.entries(MENTORIA_CANONICAL_ALIASES)) {
    if (AEF_COURSES_METADATA[target]) {
      Object.defineProperty(AEF_COURSES_METADATA, alias, {
        get() { return AEF_COURSES_METADATA[target]; },
        enumerable: false,
        configurable: true
      });
    }
  }

  function getCourseMetadata(courseId) {
    if (!courseId) return null;
    const target = MENTORIA_CANONICAL_ALIASES[courseId] || courseId;
    return AEF_COURSES_METADATA[target] || null;
  }

  function getAllCoursesMetadata() {
    return AEF_COURSES_METADATA;
  }

  if (typeof root !== "undefined") {
    root.AEF_COURSES_METADATA = AEF_COURSES_METADATA;
    root.getCourseMetadata = getCourseMetadata;
    root.getAllCoursesMetadata = getAllCoursesMetadata;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AEF_COURSES_METADATA;
    module.exports.AEF_COURSES_METADATA = AEF_COURSES_METADATA;
    module.exports.getCourseMetadata = getCourseMetadata;
    module.exports.getAllCoursesMetadata = getAllCoursesMetadata;
  }
})(typeof window !== "undefined" ? window : globalThis);
