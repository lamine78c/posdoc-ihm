package fr.acoss.posdoc.ws.aop;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.UtiLogRepository;
import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Optional;

@Aspect
@Configuration
public class HistorisableAspect {
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    UtiLogRepository utiLogRepository;
    @Autowired
    VersionAdelaideService versionAdelaideService;

    @Before("@annotation(fr.acoss.posdoc.ws.aop.annotation.Historisable)")
    public void before(JoinPoint joinPoint) {
        if (logger.isDebugEnabled()) {
            logger.debug("Before : Allowed execution for {}", joinPoint);
        }
        Context context = ContextHolder.getContext();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Historisable historisable = signature.getMethod().getAnnotation(Historisable.class);
        UtiLogEntity result = utiLogRepository.save(createUtilog(historisable, context));
        context.setId(result.getCodulo());
        if (logger.isDebugEnabled()) {
            logger.debug("Before : context id {} ", context.getId());
        }
    }

    private @NotNull UtiLogEntity createUtilog(final Historisable historisable, final Context context) {
        UtiLogEntity utiLogEntity = new UtiLogEntity();
        utiLogEntity.setAction(historisable.action().getLibelle());
        utiLogEntity.setFormid(historisable.form());
        utiLogEntity.setCodsta(context.getHost());
        utiLogEntity.setCodusr(context.getUser());
        utiLogEntity.setDatulo(LocalDateTime.now());
        utiLogEntity.setVersio(this.versionAdelaideService.getAdelaideVersion());
        utiLogEntity.setResult(false);
        return utiLogEntity;
    }

    @After("@annotation(fr.acoss.posdoc.ws.aop.annotation.Historisable)")
    public void after(JoinPoint joinPoint) {
        if (logger.isDebugEnabled()) {
            logger.debug(" After : Allowed execution for {}", joinPoint);
        }
        Context context = ContextHolder.getContext();
        Optional<UtiLogEntity> optionalUtiLogEntity;
        optionalUtiLogEntity = utiLogRepository.findById(context.getId());
        if (optionalUtiLogEntity.isPresent()) {
            UtiLogEntity utiLogEntity = optionalUtiLogEntity.get();
            if (utiLogEntity.getErreur() == null) {
                utiLogEntity.setResult(true);
            }
            utiLogRepository.save(utiLogEntity);
        }
        if (logger.isDebugEnabled()) {
            logger.debug("After : context id {}", context.getId());
        }
    }

    @AfterThrowing(pointcut = "@annotation(fr.acoss.posdoc.ws.aop.annotation.Historisable)", throwing = "ex")
    public void handleException(JoinPoint joinPoint, Throwable ex) {
        if (logger.isDebugEnabled()) {
            logger.debug(" handleException : for {}", joinPoint);
        }
        Context context = ContextHolder.getContext();
        Optional<UtiLogEntity> optionalUtiLogEntity;
        optionalUtiLogEntity = utiLogRepository.findById(context.getId());
        if (optionalUtiLogEntity.isPresent()) {
            UtiLogEntity utiLogEntity = optionalUtiLogEntity.get();
            utiLogEntity.setErreur(ex.getMessage());
            utiLogRepository.save(utiLogEntity);
        }
        if (logger.isDebugEnabled()) {
            logger.debug("handleException : context id {}", context.getId());
        }
    }


}
