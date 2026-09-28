package fr.acoss.posdoc.database.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface GenericRepository<T, I>
    extends JpaRepository<T, I>, JpaSpecificationExecutor<T> {}
