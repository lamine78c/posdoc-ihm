import { TestBed } from '@angular/core/testing';

import { NotesService, SUCCESS_TOAST_DELAY, Toast, ToastCategoryEnum } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;

  const successToast = (title: string): Toast => ({
    title,
    classname: 'note-confirmation',
    category: ToastCategoryEnum.SUCCESS,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should stack toasts without category', () => {
      service.show({ title: 'note 1', classname: 'note-erreur' });
      service.show({ title: 'note 2', classname: 'note-erreur' });

      expect(service.toasts.length).toBe(2);
    });

    it('should stack error toasts without altering their delay', () => {
      const erreur: Toast = { title: 'erreur 1', classname: 'note-erreur', category: ToastCategoryEnum.ERROR };
      service.show(erreur);
      service.show({ title: 'erreur 2', classname: 'note-erreur', category: ToastCategoryEnum.ERROR });

      expect(service.toasts.length).toBe(2);
      expect(erreur.delay).toBeUndefined();
    });

    it('should replace the previous success toast with the new one', () => {
      service.show(successToast('succès 1'));
      service.show(successToast('succès 2'));

      const successToasts = service.toasts.filter(t => t.category === ToastCategoryEnum.SUCCESS);
      expect(successToasts.length).toBe(1);
      expect(successToasts[0].title).toBe('succès 2');
    });

    it('should not remove toasts of other categories when showing a success', () => {
      service.show({ title: 'erreur', classname: 'note-erreur', category: ToastCategoryEnum.ERROR });
      service.show(successToast('succès'));

      expect(service.toasts.length).toBe(2);
    });

    it('should apply the default success delay', () => {
      service.show(successToast('succès'));

      expect(service.toasts[0].delay).toBe(SUCCESS_TOAST_DELAY);
    });

    it('should keep the caller explicit delay on a success', () => {
      service.show({ ...successToast('succès'), delay: 8000 });

      expect(service.toasts[0].delay).toBe(8000);
    });
  });
});
