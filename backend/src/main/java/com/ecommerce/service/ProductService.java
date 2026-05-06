package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductDTO> getActiveProducts(Pageable pageable) {
        return productRepository.findAllByIsActiveTrue(pageable)
                .map(this::toDto);
    }

    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id).map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        var entity = toEntity(dto);
        var saved = productRepository.save(entity);
        return toDto(saved);
    }

    private ProductDTO toDto(Product p) {
        var dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        dto.setImageUrl(p.getImageUrl());
        return dto;
    }

    private Product toEntity(ProductDTO dto) {
        var p = new Product();
        p.setId(dto.getId());
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setStock(dto.getStock());
        p.setImageUrl(dto.getImageUrl());
        return p;
    }
}