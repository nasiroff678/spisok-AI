import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ExternalLink, Filter, Trash2, Save, X, Database, LayoutGrid, List, Pencil, Loader2, Sparkles, Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// --- ВАША КОНФИГУРАЦИЯ FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyArF92vaq7lf3LXbtkLbXcziFKfDwku8RQ",
  authDomain: "spisok-ai-bb722.firebaseapp.com",
  projectId: "spisok-ai-bb722",
  storageBucket: "spisok-ai-bb722.firebasestorage.app",
  messagingSenderId: "156094037190",
  appId: "1:156094037190:web:ab7cfba640b9ab6d4a2bc7",
  measurementId: "G-PN48BS8YH0"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// --- ПОЛНЫЙ СПИСОК (96 инструментов) ---
const INITIAL_DATA = [
  { category: 'Чат-боты и Тексты', name: 'ChatGPT', url: 'https://chat.openai.com/', description: 'Самый популярный чат-бот от OpenAI' },
  { category: 'Чат-боты и Тексты', name: 'Claude', url: 'https://www.anthropic.com/claude', description: 'Умный ассистент для работы с текстами' },
  { category: 'Изображения', name: 'Leonardo.ai', url: 'https://app.leonardo.ai/ai-generations', description: 'Генерация качественных арт-изображений' },
  { category: 'Презентации и Сайты', name: 'Gamma', url: 'https://gamma.app', description: 'Создание презентаций и веб-страниц из текста' },
  { category: 'Разработка', name: 'Trace', url: 'https://www.trace.zip/', description: 'Инструмент для создания приложений (SwiftUI)' },
  { category: 'Дизайн Интерьера', name: 'HomeByMe', url: 'https://home.by.me/en/', description: 'Планирование интерьера в 3D' },
  { category: 'Видео и 3D', name: 'Luma Dream Machine', url: 'https://lumalabs.ai/', description: 'Генерация 3D-моделей и видео' },
  { category: 'Веб-разработка', name: 'Mobirise', url: 'https://a.mobirise.com/', description: 'Офлайн конструктор сайтов' },
  { category: 'Дизайн Интерьера', name: 'ReimagineHome', url: 'https://www.reimaginehome.ai/', description: 'Виртуальный стейджинг и ремонт' },
  { category: 'Аудио', name: 'Melobytes', url: 'https://melobytes.com/en/', description: 'Креативные эксперименты с музыкой и AI' },
  { category: 'Дизайн Интерьера', name: 'HomeByMe (Make)', url: 'https://home.by.me/en/makebyme/', description: 'Планирование интерьера в 3D' },
  { category: 'Аудио', name: 'Udio', url: 'https://www.udio.com/', description: 'Генерация песен высокого качества' },
  { category: 'Дизайн Интерьера', name: 'AI Room Planner', url: 'https://airoomplanner.com/', description: 'Планировка комнаты' },
  { category: 'Изображения', name: 'ImgCreator', url: 'https://imgcreator.zmo.ai/', description: 'Генерация изображений' },
  { category: 'Изображения', name: 'ZMO.ai', url: 'https://www.zmo.ai/', description: 'Генератор артов и фото' },
  { category: 'Дизайн Интерьера', name: 'Reroom', url: 'https://ru.reroom.ai/', description: 'Генерация идей интерьера' },
  { category: 'Изображения', name: 'Kandinsky (Fusion)', url: 'https://fusionbrain.ai/', description: 'Генерация картинок от Сбера' },
  { category: 'Дизайн Интерьера', name: 'RoomGPT', url: 'https://www.roomgpt.io/dream', description: 'Редизайн комнаты по фото' },
  { category: 'Веб-дизайн', name: 'Dora', url: 'https://www.dora.run/', description: '3D-сайты без кода' },
  { category: 'Разработка', name: 'Coze', url: 'https://www.coze.com/', description: 'Платформа для создания ботов' },
  { category: 'Разработка', name: 'LeadTex', url: 'https://app.leadteh.ru/', description: 'Конструктор чат-ботов' },
  { category: 'Веб-дизайн', name: 'Uizard App', url: 'https://app.uizard.io/', description: 'Прототипирование интерфейсов из набросков' },
  { category: 'Чат-боты и Тексты', name: 'GigaChat', url: 'https://developers.sber.ru/gigachat/', description: 'Российская нейросеть от Сбера' },
  { category: 'Разработка', name: 'Imagica', url: 'https://create.imagica.ai/', description: 'Создание AI-приложений без кода' },
  { category: 'Разное', name: 'Google DeepMind', url: 'https://deepmind.google/technologies/gemini/#introduction', description: 'Технологии Google (Gemini, Veo)' },
  { category: 'Чат-боты и Тексты', name: 'Gemini', url: 'https://gemini.google.com/', description: 'Мультимодальная модель от Google' },
  { category: 'Чат-боты и Тексты', name: 'LMSYS Arena', url: 'https://chat.lmsys.org/?leaderboard', description: 'Сравнение LLM моделей' },
  { category: 'Разработка', name: 'OpenRouter', url: 'https://openrouter.ai/', description: 'Агрегатор API нейросетей' },
  { category: 'Видео', name: 'HeyGen', url: 'https://www.heygen.com/', description: 'Создание видео с цифровыми аватарами' },
  { category: 'Чат-боты и Тексты', name: 'Copilot', url: 'https://copilot.microsoft.com/', description: 'Ассистент от Microsoft' },
  { category: 'Изображения', name: 'Midjourney', url: 'https://www.midjourney.com/', description: 'Топовая нейросеть для генерации картинок' },
  { category: 'Аудио', name: 'MusicGen', url: 'https://musicgen.com/', description: 'Генерация музыки' },
  { category: 'Аудио', name: 'LimeWire', url: 'https://limewire.com/studio/audio/create-music', description: 'Создание музыки и картинок' },
  { category: 'Изображения', name: 'Kandinsky Promo', url: 'https://www.sberbank.com/promo/kandinsky/', description: 'Промо-страница Kandinsky' },
  { category: 'Аудио', name: 'Suno', url: 'https://suno.com/', description: 'Генерация песен с вокалом' },
  { category: '3D и AR', name: 'Polycam', url: 'https://poly.cam/', description: 'Сканирование объектов в 3D' },
  { category: 'Изображения', name: 'Stability AI', url: 'https://stability.ai/', description: 'Создатели Stable Diffusion' },
  { category: 'Веб-дизайн', name: 'Uizard', url: 'https://uizard.io/', description: 'Прототипирование интерфейсов' },
  { category: 'Аудио', name: 'Soundful', url: 'https://my.soundful.com/', description: 'Фоновая музыка без авторских прав' },
  { category: 'Видео', name: 'Hailuo AI', url: 'https://hailuoai.video/', description: 'Генерация видео' },
  { category: 'Изображения', name: 'OpenArt', url: 'https://openart.ai/', description: 'Платформа для поиска и создания артов' },
  { category: 'Разное', name: 'YouWare', url: 'https://www.youware.com/', description: 'ПО и инструменты' },
  { category: 'Разное', name: 'Zoer', url: 'https://zoer.ai/', description: 'AI инструменты' },
  { category: 'Разработка', name: 'Bolt', url: 'https://bolt.new/', description: 'Веб-разработка в браузере' },
  { category: 'Видео', name: 'Director.ai', url: 'https://www.director.ai/', description: 'Создание видео контента' },
  { category: 'Разработка', name: 'Cursor', url: 'https://cursor.com/', description: 'Редактор кода с AI' },
  { category: 'Веб-дизайн', name: 'v0', url: 'https://v0.app/', description: 'Генерация UI-компонентов' },
  { category: 'Разное', name: 'Base44', url: 'https://app.base44.com/', description: 'Инструменты' },
  { category: 'Разработка', name: 'Lovable', url: 'https://lovable.dev/', description: 'Генерация софта (GPT Engineer)' },
  { category: 'Разное', name: 'Flux', url: 'https://flux2.io/', description: 'Вероятно Flux для изображений или данных' },
  { category: 'Чат-боты и Тексты', name: 'LMArena', url: 'https://lmarena.ai/', description: 'Арена сравнения моделей' },
  { category: 'Разработка', name: 'HuggingFace', url: 'https://huggingface.co/spaces/enzostvs/deepsite', description: 'Платформа для ML моделей' },
  { category: 'Видео', name: 'HeyGen App', url: 'https://app.heygen.com/', description: 'Создание видео с цифровыми аватарами' },
  { category: 'Чат-боты и Тексты', name: 'DeepSeek', url: 'https://chat.deepseek.com/', description: 'Китайская модель для кода и чата' },
  { category: 'Чат-боты и Тексты', name: 'Kimi', url: 'https://www.kimi.com/', description: 'Ассистент с большим контекстом' },
  { category: 'Дизайн', name: 'Figma', url: 'https://www.figma.com/', description: 'Инструмент для дизайна интерфейсов' },
  { category: 'Чат-боты и Тексты', name: 'Grok', url: 'https://grok.com/', description: 'AI от xAI' },
  { category: 'Видео', name: 'Sora', url: 'https://sora.chatgpt.com/', description: 'Генерация видео от OpenAI' },
  { category: 'Чат-боты и Тексты', name: 'Mistral', url: 'https://chat.mistral.ai/', description: 'Открытые модели из Европы' },
  { category: 'Разработка', name: 'GitHub', url: 'https://github.com/', description: 'Хостинг кода и Copilot' },
  { category: 'Разработка', name: 'Replit', url: 'https://replit.com/', description: 'Онлайн IDE с AI' },
  { category: 'Разработка', name: 'Browserbase', url: 'https://www.browserbase.com/', description: 'Инфраструктура браузеров' },
  { category: 'Аудио', name: 'ElevenLabs', url: 'https://elevenlabs.io/', description: 'Синтез речи и клонирование голоса' },
  { category: 'Чат-боты и Тексты', name: 'Qwen', url: 'https://chat.qwen.ai/', description: 'Модель от Alibaba' },
  { category: 'Поиск', name: 'GenSpark', url: 'https://www.genspark.ai/', description: 'AI-агент для поиска' },
  { category: 'Чат-боты и Тексты', name: 'Claude AI', url: 'https://claude.ai/', description: 'Чат-бот от Anthropic' },
  { category: 'Разное', name: 'Manus', url: 'https://manus.im/', description: 'AI инструмент' },
  { category: 'Изображения', name: 'GetImg', url: 'https://getimg.ai/', description: 'Редактор и генератор изображений' },
  { category: 'Дизайн', name: 'Canva', url: 'https://www.canva.com/', description: 'Графический редактор' },
  { category: 'Разработка', name: 'Abacus.ai', url: 'https://apps.abacus.ai/', description: 'AI для бизнеса и ML' },
  { category: 'Презентации и Сайты', name: 'Gamma App', url: 'https://gamma.app/', description: 'Создание презентаций и веб-страниц' },
  { category: 'Разное', name: 'Bohrium', url: 'https://www.bohrium.com/', description: 'Вычисления/Наука' },
  { category: 'Документы', name: 'NotebookLM', url: 'https://notebooklm.google.com/', description: 'Анализ заметок и документов' },
  { category: 'Разработка', name: 'Google AI Studio', url: 'https://aistudio.google.com/', description: 'Студия разработки AI' },
  { category: 'Разное', name: 'Veo', url: 'https://deepmind.google/models/veo/', description: 'Видео технологии Google' },
  { category: 'Эксперименты', name: 'Google Labs Flow', url: 'https://labs.google/flow', description: 'Тестовые проекты Google' },
  { category: 'Документы', name: 'Doczilla', url: 'https://doczilla.pro/ai/', description: 'Конструктор документов' },
  { category: 'Разное', name: 'Oblako', url: 'https://app.oblako.ai/', description: 'Облачные решения' },
  { category: 'Разное', name: 'Gonka', url: 'https://gonka.ai/', description: 'AI Ресурс' },
  { category: 'Разное', name: 'Dreamflow', url: 'https://app.dreamflow.com/', description: 'Управление процессами' },
  { category: 'Разработка', name: 'Adalo', url: 'https://app.adalo.com/', description: 'Мобильные приложения No-Code' },
  { category: 'Работа', name: 'Upwork', url: 'https://www.upwork.com/', description: 'Фриланс биржа' },
  { category: 'Разработка', name: 'Sber Developers', url: 'https://developers.sber.ru/studio', description: 'Платформа разработки Сбер' },
  { category: 'Веб-разработка', name: 'Webflow', url: 'https://webflow.com/', description: 'Конструктор сайтов' },
  { category: 'Маркетинг', name: 'Marquiz', url: 'https://panel.marquiz.ru/', description: 'Квизы и опросы' },
  { category: 'Чат-боты и Тексты', name: 'GigaChat Web', url: 'https://giga.chat/', description: 'Веб-версия GigaChat' },
  { category: 'Дизайн', name: 'Supa', url: 'https://supa.ru/', description: 'Конструктор для соцсетей' },
  { category: 'Эксперименты', name: 'MusicFX DJ', url: 'https://labs.google/fx/ru/tools/music-fx-dj', description: 'Музыкальные эксперименты' },
  { category: 'Изображения', name: 'Photoroom', url: 'https://app.photoroom.com/', description: 'Удаление фона, фото товаров' },
  { category: 'Видео', name: 'Runway', url: 'https://app.runwayml.com/', description: 'Профессиональный генератор видео' },
  { category: 'Изображения', name: 'Freepik', url: 'https://ru.freepik.com/', description: 'Стоки и генерация' },
  { category: 'Видео', name: 'Dreamina', url: 'https://dreamina.capcut.com/', description: 'Генератор от CapCut' },
  { category: 'Разработка', name: 'Seed (ByteDance)', url: 'https://seed.bytedance.com/', description: 'Инструменты ByteDance' },
  { category: 'Эксперименты', name: 'Labs API', url: 'https://labs.google/fx/api/', description: 'API экспериментов' },
  { category: 'Разработка', name: 'Firebase', url: 'https://firebase.google.com/', description: 'Платформа приложений' },
  { category: 'Разработка', name: 'Jules', url: 'https://jules.google.com/', description: 'Инструмент для кода (экспериментальный)' }
];

const CATEGORIES = [
  "Все",
  "Чат-боты и Тексты",
  "Изображения",
  "Видео",
  "Аудио",
  "Разработка",
  "Веб-разработка",
  "Веб-дизайн",
  "Дизайн",
  "Дизайн Интерьера",
  "Документы",
  "Презентации и Сайты",
  "Маркетинг",
  "3D и AR",
  "Поиск",
  "Работа",
  "Эксперименты",
  "Разное"
];

function App() {
  const [user, setUser] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  
  // Состояние для модального окна удаления
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'Разное',
    description: ''
  });

  // 1. Авторизация
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Ошибка авторизации Firebase:", err);
        setAuthError("Ошибка входа! Включите 'Anonymous' в Authentication (консоль Firebase).");
        setLoading(false);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && !authError) setLoading(true); 
    });
    return () => unsubscribe();
  }, [authError]);

  // 2. Получение данных
  useEffect(() => {
    if (!user) return; 

    const q = query(collection(db, 'ai_tools'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const toolsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        toolsData.sort((a, b) => a.name.localeCompare(b.name));
        setTools(toolsData);
        setLoading(false);
      },
      (error) => {
        console.error("Ошибка получения данных:", error);
        setLoading(false); 
        if (error.code === 'permission-denied') {
            setAuthError("Нет доступа к данным! Проверьте Firestore Rules.");
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const seedData = async () => {
    if (!user) {
        alert("Подождите завершения авторизации...");
        return;
    }
    setLoading(true);
    const batch = writeBatch(db);
    const collectionRef = collection(db, 'ai_tools');
    
    INITIAL_DATA.forEach((item) => {
      const docRef = doc(collectionRef); 
      batch.set(docRef, { ...item, createdAt: new Date().toISOString() });
    });

    try {
      await batch.commit();
      console.log("Данные успешно загружены");
    } catch (e) {
      console.error("Ошибка загрузки данных:", e);
      if (e.code === 'permission-denied') {
          alert("Ошибка записи! Зайдите в Firebase Console -> Firestore -> Rules и разрешите запись.");
      } else {
          alert("Ошибка при загрузке: " + e.message);
      }
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setDuplicateWarning(null);
    setFormData({ name: '', url: '', category: 'Разное', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (tool) => {
    setEditingId(tool.id);
    setDuplicateWarning(null);
    setFormData({
      name: tool.name,
      url: tool.url,
      category: tool.category,
      description: tool.description
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  // Удалена дублирующая функция handleDeleteTool, которая принимала id
  // Оставлена только версия для модального окна

  const handleDeleteTool = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'ai_tools', itemToDelete));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      if (error.code === 'permission-denied') {
        setDeleteError("Ошибка доступа. Проверьте права в Firebase Console.");
      } else {
        setDeleteError("Не удалось удалить: " + error.message);
      }
    }
  };

  const checkDuplicate = (url, name, currentId) => {
      const cleanUrl = url ? url.toLowerCase().trim().replace(/\/$/, '') : '';
      const cleanName = name ? name.toLowerCase().trim() : '';

      const found = tools.find(tool => {
          if (currentId && tool.id === currentId) return false;
          const toolUrl = tool.url ? tool.url.toLowerCase().trim().replace(/\/$/, '') : '';
          const toolName = tool.name ? tool.name.toLowerCase().trim() : '';
          return (cleanUrl && toolUrl === cleanUrl) || (cleanName && toolName === cleanName);
      });
      return found;
  };

  const handleAutoFill = async () => {
    const url = formData.url;
    if (!url) {
      alert("Пожалуйста, сначала вставьте ссылку.");
      return;
    }

    const duplicate = checkDuplicate(url, '', editingId);
    if (duplicate) {
        setDuplicateWarning(`Инструмент с такой ссылкой уже существует: "${duplicate.name}"`);
    } else {
        setDuplicateWarning(null);
    }

    setIsAutoFilling(true);
    try {
      let domainName = 'Unknown';
      try {
        const hostname = new URL(url).hostname;
        domainName = hostname.replace('www.', '').split('.')[0];
        domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
      } catch (e) {}

      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) throw new Error("No content");

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, "text/html");

      const titleText = doc.querySelector('title')?.innerText || domainName;
      const cleanName = titleText.split(/ [|-] /)[0].trim().substring(0, 30);

      const metaDesc = 
        doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
        doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
        "";
      
      const cleanDesc = metaDesc.substring(0, 150) + (metaDesc.length > 150 ? '...' : '');

      const textToScan = (cleanName + " " + cleanDesc).toLowerCase();
      let guessedCategory = 'Разное';
      
      if (textToScan.includes('chat') || textToScan.includes('gpt')) guessedCategory = 'Чат-боты и Тексты';
      else if (textToScan.includes('image') || textToScan.includes('art')) guessedCategory = 'Изображения';
      else if (textToScan.includes('video')) guessedCategory = 'Видео';
      else if (textToScan.includes('music') || textToScan.includes('audio')) guessedCategory = 'Аудио';
      else if (textToScan.includes('code') || textToScan.includes('dev')) guessedCategory = 'Разработка';

      let finalDesc = cleanDesc;
      if (cleanDesc) {
         const cyrillicCount = (cleanDesc.match(/[а-яА-ЯёЁ]/g) || []).length;
         const isRussian = cleanDesc.length > 0 && (cyrillicCount / cleanDesc.length) > 0.05;
         
         if (!isRussian) {
             try {
                const translateRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanDesc)}&langpair=en|ru`);
                const translateData = await translateRes.json();
                if (translateData?.responseData?.translatedText) {
                    finalDesc = translateData.responseData.translatedText;
                }
             } catch (e) {
                 console.warn("Translation failed");
             }
         }
      }

      setFormData(prev => ({
        ...prev,
        name: cleanName || domainName,
        description: finalDesc,
        category: guessedCategory
      }));

    } catch (error) {
      console.error("Auto-fill failed:", error);
      try {
        const hostname = new URL(url).hostname;
        let domainName = hostname.replace('www.', '').split('.')[0];
        setFormData(prev => ({ ...prev, name: domainName }));
      } catch(e) {}
      alert("Не удалось получить полные данные. Заполнено только название.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    if (!user) {
        alert("Нет соединения с базой данных (пользователь не авторизован).");
        return;
    }

    const duplicate = checkDuplicate(formData.url, formData.name, editingId);
    if (duplicate) {
        if (!window.confirm(`Внимание! Инструмент "${duplicate.name}" уже существует. Создать дубликат?`)) {
            return;
        }
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const docRef = doc(db, 'ai_tools', editingId);
        await updateDoc(docRef, { ...formData, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'ai_tools'), { ...formData, createdAt: new Date().toISOString() });
      }
      setIsModalOpen(false);
      setFormData({ name: '', url: '', category: 'Разное', description: '' });
      setEditingId(null);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      if (error.code === 'permission-denied') {
          alert("Ошибка: Недостаточно прав для записи в базу данных. Проверьте Rules в Firebase Console.");
      } else {
          alert("Не удалось сохранить: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFaviconUrl = (url) => {
    try {
      if (!url) return '';
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        (tool.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (tool.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Все' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">
        <div className="animate-spin mr-3">
           <Loader2 size={24} />
        </div>
        Подключение к вашей базе данных...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4 text-center">
        <AlertCircle size={48} className="mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Ошибка подключения</h2>
        <p className="max-w-md">{authError}</p>
        <p className="mt-4 text-sm text-red-600">Проверьте консоль браузера для деталей.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Database className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">AI Каталог</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium ml-2 border border-gray-200 hidden sm:inline-block">
                {tools.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                 <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}><List size={18} /></button>
                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid size={18} /></button>
              </div>
              <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                <Plus size={18} />
                <span className="hidden sm:inline">Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="sticky top-16 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200 shadow-sm py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Поиск по названию или описанию..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all" />
            </div>
            <div className="relative min-w-[220px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm appearance-none cursor-pointer">
                {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Кнопка начальной загрузки */}
        {tools.length < 10 && !loading && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center animate-fade-in mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              {tools.length === 0 ? "База данных пуста" : "Добавить остальные инструменты?"}
            </h3>
            <p className="text-blue-600 mb-4">
              {tools.length === 0 
                ? "Нажмите кнопку ниже, чтобы загрузить все 96 инструментов." 
                : "В базе мало записей. Хотите догрузить полный список (96 шт)?"}
            </p>
            <button onClick={seedData} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
              <Database size={18} />
              {tools.length === 0 ? "Загрузить начальный список" : "Догрузить полный список"}
            </button>
          </div>
        )}

        {tools.length > 0 && filteredTools.length === 0 ? (
           <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><Search className="text-gray-400 h-8 w-8" /></div>
              <h3 className="text-lg font-medium text-gray-900">Ничего не найдено</h3>
              <p className="text-gray-500">Попробуйте изменить параметры поиска или категорию.</p>
           </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Инструмент</th>
                        <th className="px-6 py-4 hidden md:table-cell">Категория</th>
                        <th className="px-6 py-4 hidden lg:table-cell">Описание</th>
                        <th className="px-6 py-4 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTools.map((tool) => (
                        <tr key={tool.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <img src={getFaviconUrl(tool.url)} alt={tool.name ? tool.name[0] : ''} className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                <div className="hidden w-full h-full items-center justify-center text-indigo-600 font-bold text-lg bg-indigo-50">{tool.name ? tool.name[0] : '?'}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{tool.name}</div>
                                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-0.5 md:hidden">Открыть <ExternalLink size={10} /></a>
                                <div className="md:hidden text-xs text-gray-500 mt-1 truncate max-w-[200px]">{tool.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{tool.category}</span></td>
                          <td className="px-6 py-4 hidden lg:table-cell"><p className="text-sm text-gray-600 truncate max-w-xs xl:max-w-md">{tool.description}</p></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditModal(tool)} className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={18} /></button>
                              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors hidden md:flex"><ExternalLink size={18} /></a>
                              <button onClick={() => confirmDelete(tool.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {viewMode === 'grid' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => (
                     <div key={tool.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col h-full group relative">
                        <div className="flex justify-between items-start mb-3">
                           <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                <img src={getFaviconUrl(tool.url)} alt={tool.name ? tool.name[0] : ''} className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                <div className="hidden w-full h-full items-center justify-center text-indigo-600 font-bold text-xl bg-indigo-50">{tool.name ? tool.name[0] : '?'}</div>
                           </div>
                           <div className="flex gap-1 bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                             <button onClick={() => openEditModal(tool)} className="text-gray-600 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"><Pencil size={16} /></button>
                             <button onClick={() => confirmDelete(tool.id)} className="text-gray-600 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{tool.name}</h3>
                        <span className="inline-flex self-start items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mb-3">{tool.category}</span>
                        <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">{tool.description}</p>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="w-full mt-auto bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-gray-100 hover:border-indigo-100">Перейти <ExternalLink size={14} /></a>
                     </div>
                  ))}
               </div>
            )}
          </>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Редактировать' : 'Добавить инструмент'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {duplicateWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div><p className="font-medium">Найден дубликат!</p><p>{duplicateWarning}</p></div>
                  </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка</label>
                <div className="flex gap-2">
                  <input type="url" required value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="https://..." />
                  <button type="button" onClick={handleAutoFill} disabled={isAutoFilling || !formData.url} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 rounded-lg flex items-center justify-center transition-colors border border-purple-200 disabled:opacity-50" title="Авто-заполнение">{isAutoFilling ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}</button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Волшебная палочка заполнит название и описание автоматически.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Например: Midjourney" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                  {CATEGORIES.filter(c => c !== "Все").map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-24 resize-none" placeholder="Краткое описание возможностей..." />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Удалить инструмент?</h3>
            <p className="text-sm text-gray-500 mb-6">Вы уверены, что хотите удалить этот инструмент? Это действие нельзя отменить.</p>
            
            {deleteError && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setDeleteModalOpen(false); setDeleteError(null); }}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteTool}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
