import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';

// Enregistrer le module de redimensionnement d'images
try {
  Quill.register('modules/imageResize', ImageResize);
} catch (e) {
  // Erreur lors de l'enregistrement du module (peut arriver en environnement de test)
  console.debug('Could not register quill-image-resize-module:', e);
}

/**
 * Configuration par défaut pour l'éditeur Quill avec support du redimensionnement d'images
 */
export const QUILL_DEFAULT_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean'],
    ['link', 'image']
  ],
  imageResize: {
    displaySize: true,
    modules: ['Resize', 'DisplaySize', 'Toolbar']
  }
};

/**
 * Configuration simplifiée pour l'éditeur Quill (sans options avancées)
 */
export const QUILL_SIMPLE_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image']
  ],
  imageResize: {
    displaySize: true,
    modules: ['Resize', 'DisplaySize']
  }
};
