import React, { useState, useMemo, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { AEFDocument } from './renderer/PDFDocument';
import { PDFDocumentPayloadSchema } from './schemas/pdfSchema';
import { db, storage } from './lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface LessonOption {
  path: string;
  label: string;
}

function App() {
  const [jsonInput, setJsonInput] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  
  // States para gerenciar o vínculo com Firestore
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonPath, setSelectedLessonPath] = useState<string>('');
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // Memoize do parse JSON e Zod validation
  const { parsedData, error } = useMemo(() => {
    try {
      const rawObj = JSON.parse(jsonInput);
      const validData = PDFDocumentPayloadSchema.parse(rawObj);
      return { parsedData: validData, error: null };
    } catch (e: any) {
      return { parsedData: null, error: e.message || 'JSON Inválido ou Schema Incompatível' };
    }
  }, [jsonInput]);

  // Busca as aulas no Firestore para popular o select
  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const coursesSnap = await getDocs(collection(db, 'courses'));
        let options: LessonOption[] = [];
        
        for (const cDoc of coursesSnap.docs) {
          const courseId = cDoc.id;
          const courseTitle = cDoc.data().title || courseId;
          
          const modulesSnap = await getDocs(collection(db, `courses/${courseId}/modules`));
          for (const mDoc of modulesSnap.docs) {
            const moduleId = mDoc.id;
            
            const lessonsSnap = await getDocs(collection(db, `courses/${courseId}/modules/${moduleId}/lessons`));
            for (const lDoc of lessonsSnap.docs) {
              const lessonId = lDoc.id;
              const lessonTitle = lDoc.data().title || lessonId;
              
              const moduleTitle = mDoc.data().title || moduleId;
              options.push({
                path: `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
                label: `${courseTitle} > ${moduleTitle} > ${lessonTitle}`
              });
            }
          }
        }
        
        setLessons(options);
        if (options.length > 0) {
          setSelectedLessonPath(options[0].path);
        }
      } catch (err) {
        console.error("Erro ao buscar aulas:", err);
      } finally {
        setIsLoadingLessons(false);
      }
    }
    fetchLessons();
  }, []);

  // Função para simular o Pipeline de Publicação
  const handlePublish = async () => {
    if (!parsedData || !selectedLessonPath) {
      setPublishStatus('❌ Selecione uma aula primeiro.');
      return;
    }
    
    setIsPublishing(true);
    setPublishStatus('1/3 Gerando Blob do PDF...');
    
    try {
      // Magia do React-PDF: Extrai o binário sem renderizar na tela
      const blob = await pdf(<AEFDocument data={parsedData} />).toBlob();
      
      setPublishStatus('2/3 Fazendo upload no Storage...');
      const fileName = `pdf_materials_v2/${parsedData.documentId}_${Date.now()}.pdf`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      setPublishStatus('3/3 Salvando Receita no Firestore...');
      // 1. Atualizar a aula
      const lessonRef = doc(db, selectedLessonPath);
      await updateDoc(lessonRef, {
        pdfUrl: downloadUrl,
        pdfUpdatedAt: new Date().toISOString()
      });
      
      // 2. Salvar a receita JSON
      const recipeRef = doc(db, 'pdf_recipes_v2', parsedData.documentId || `recipe_${Date.now()}`);
      await setDoc(recipeRef, {
        ...parsedData,
        lessonPath: selectedLessonPath,
        updatedAt: new Date().toISOString()
      });
      
      const kbSize = Math.round(blob.size / 1024);
      setPublishStatus(`✅ Publicado! (Blob ${kbSize}kb)`);
    } catch (err: any) {
      console.error(err);
      setPublishStatus('❌ Erro: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar / Editor */}
      <div className="w-1/3 bg-factory-sidebar border-r border-factory-border flex flex-col z-10 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-factory-border bg-factory-bg">
          <h1 className="text-xl font-bold text-amber-500">PDF Factory V2</h1>
          <p className="text-sm text-slate-400">Editor JSON e Validador</p>
        </div>
        
        <div className="flex-1 p-4 flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-slate-400">Payload JSON da IA</label>
          <textarea 
            className="flex-1 w-full min-h-[300px] bg-factory-panel border border-factory-border rounded p-4 text-sm font-mono text-slate-300 focus:outline-none focus:border-amber-500 resize-none"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          
          {/* Box de Status (Zod) */}
          <div className={`mt-2 p-3 rounded text-sm font-mono ${error ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50'}`}>
            {error ? (
              <div>
                <span className="font-bold">Erro de Validação (Zod):</span>
                <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">{error}</pre>
              </div>
            ) : (
              <span className="font-bold">✓ Schema JSON Válido. PDF atualizado.</span>
            )}
          </div>

          {/* Painel de Publicação (Mock de Integração) */}
          <div className="mt-4 p-4 border border-factory-border bg-factory-panel rounded flex flex-col gap-3">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Integração Cloud (Publish)</h2>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Vincular à Aula</label>
              <select 
                className="w-full bg-factory-bg border border-factory-border rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                value={selectedLessonPath}
                onChange={(e) => setSelectedLessonPath(e.target.value)}
                disabled={isLoadingLessons}
              >
                {isLoadingLessons ? (
                  <option>Carregando aulas do Cloud...</option>
                ) : lessons.length > 0 ? (
                  lessons.map(l => (
                    <option key={l.path} value={l.path}>{l.label}</option>
                  ))
                ) : (
                  <option value="">Nenhuma aula encontrada</option>
                )}
              </select>
            </div>

            <button 
              onClick={handlePublish}
              disabled={!parsedData || isPublishing || !selectedLessonPath}
              className={`w-full py-2 rounded font-bold transition-all ${!parsedData ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : isPublishing ? 'bg-amber-600/50 text-white cursor-wait' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {isPublishing ? 'Processando...' : '☁️ Publicar Material'}
            </button>

            {publishStatus && (
              <div className={`text-xs font-mono text-center mt-1 ${publishStatus.includes('✅') ? 'text-emerald-400' : publishStatus.includes('❌') ? 'text-red-400' : 'text-slate-300'}`}>
                {publishStatus}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-[#525659] flex flex-col relative h-full">
        <PDFViewer width="100%" height="100%" className="border-none">
          <AEFDocument data={parsedData} />
        </PDFViewer>
      </div>
    </div>
  );
}

export default App;
