package fr.acoss.posdoc.domain.genetp.primary;

import fr.acoss.posdoc.domain.genetp.model.FirstVideoStep;
import fr.acoss.posdoc.domain.genetp.model.VideoStep;
import fr.acoss.posdoc.domain.genetp.model.VideoStepPayload;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.types.GenEtpType;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class GenEtpService {
  private final GenEtpPersistence genEtpPersistence;

  public GenEtpService(final GenEtpPersistence genEtpPersistence) {
    this.genEtpPersistence = genEtpPersistence;
  }

  public FirstVideoStep getFirstVideoStep(VideoStepPayload videoStepPayload) {
    return this.genEtpPersistence.getFirstVideoStep(videoStepPayload);
  }

  public List<VideoStep> getVideoSteps(VideoStepPayload payload) {
    List<VideoStep> allVideoSteps = this.genEtpPersistence.getVideoSteps(payload);

    if (isAnnexeFilterEmpty(payload)) {
      return allVideoSteps;
    }

    FirstVideoStep firstVideoStep = genEtpPersistence.getFirstVideoStep(payload);

    return allVideoSteps.stream()
            .filter(step -> isStepOk(step, payload, allVideoSteps, firstVideoStep))
            .collect(Collectors.toList());
  }

  private boolean isAnnexeFilterEmpty(VideoStepPayload payload) {
    return !StringUtils.hasText(payload.getCodcom())
            && !StringUtils.hasText(payload.getCodgam())
            && !StringUtils.hasText(payload.getStatut())
            && !StringUtils.hasText(payload.getEtpfus())
            && !Boolean.TRUE.equals(payload.getReedit());
  }

  private boolean isStepOk(VideoStep step, VideoStepPayload payload, List<VideoStep> allVideoSteps, FirstVideoStep firstVideoStep) {

    return StringUtils.hasText(payload.getCodcom())
            && hasValueInStepOrTree(step, allVideoSteps, firstVideoStep, VideoStep::getCodcom, payload.getCodcom())

            || StringUtils.hasText(payload.getCodgam())
            && hasValueInStepOrTree(step, allVideoSteps, firstVideoStep, VideoStep::getCodgam, payload.getCodgam())

            || StringUtils.hasText(payload.getStatut())
            && hasValueInStepOrTree(step, allVideoSteps, firstVideoStep, VideoStep::getStatut, payload.getStatut())

            || StringUtils.hasText(payload.getEtpfus())
            && hasValueInStepOrTree(step, allVideoSteps, firstVideoStep, VideoStep::getEtpfus, payload.getEtpfus())

            || Boolean.TRUE.equals(payload.getReedit())
            && hasReeditInStepOrTree(step, allVideoSteps, firstVideoStep);
  }

  private boolean hasReeditInStepOrTree(
          VideoStep step,
          List<VideoStep> allVideoSteps,
          FirstVideoStep firstVideoStep
  ) {
    return Boolean.TRUE.equals(step.getReedit())
            || getRelatedSteps(allVideoSteps, step, firstVideoStep)
            .anyMatch(relatedStep -> Boolean.TRUE.equals(relatedStep.getReedit()));
  }

  private boolean hasValueInStepOrTree(
          VideoStep step,
          List<VideoStep> allVideoSteps,
          FirstVideoStep firstVideoStep,
          Function<VideoStep, String> getter,
          String expectedValue
  ) {
    return expectedValue.equals(getter.apply(step))
            || getRelatedSteps(allVideoSteps, step, firstVideoStep)
            .anyMatch(relatedStep -> expectedValue.equals(getter.apply(relatedStep)));
  }

  private Stream<VideoStep> getRelatedSteps(
          List<VideoStep> allVideoSteps,
          VideoStep step,
          FirstVideoStep firstVideoStep
  ) {
    return Stream.concat(
            getChildrensTree(allVideoSteps, step).stream(),
            getParentsTree(allVideoSteps, step, firstVideoStep).stream()
    );
  }

  // Method to get the children tree of a specific step (recursive)
  public List<VideoStep> getChildrensTree(List<VideoStep> nodes, VideoStep currentStep) {
    return nodes.stream()
            .filter(node -> currentStep.getIdetap().equals(node.getIdpere()))
            .flatMap(node -> Stream.concat(Stream.of(node), getChildrensTree(nodes, node).stream()))
            .collect(Collectors.toList());
  }

  // Method to get the parent tree of a specific step (recursive)
  private List<VideoStep> getParentsTree(List<VideoStep> nodes, VideoStep currentStep, FirstVideoStep firstVideoStep) {
    Stream<VideoStep> rootStepStream = GenEtpType.BIL.equals(currentStep.getTypetp())
            ? Stream.of(getVideoStepFromFirstVideoStep(firstVideoStep))
            : Stream.empty();
    return Stream.concat(
            rootStepStream,
            nodes.stream()
                    .filter(node -> currentStep.getIdpere().equals(node.getIdetap()))
                    .flatMap(node -> Stream.concat(Stream.of(node), getParentsTree(nodes, node, firstVideoStep).stream()))
    ).collect(Collectors.toList());
  }

  private VideoStep getVideoStepFromFirstVideoStep(FirstVideoStep firstVideoStep) {
    return VideoStep.builder()
            .codcom(firstVideoStep.getCodcom())
            .statut(firstVideoStep.getStatut())
            .codgam(firstVideoStep.getCodgam())
            .reedit(firstVideoStep.getReedit())
            .etpfus(firstVideoStep.getEtpfus())
            .build();
  }

}
