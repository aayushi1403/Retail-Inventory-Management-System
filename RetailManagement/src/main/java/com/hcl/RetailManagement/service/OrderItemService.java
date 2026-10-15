package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.OrderItem;
import com.hcl.RetailManagement.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    private final OrderItemRepository repository;

    public OrderItemService(OrderItemRepository repository) {
        this.repository = repository;
    }

    public OrderItem createItem(OrderItem item) {
        return repository.save(item);
    }

    public List<OrderItem> getAllItems() {
        return repository.findAll();
    }

    public List<OrderItem> getItemsByOrderId(Integer orderId) {
        return repository.findByOrder_OrderId(orderId);
    }

    public Optional<OrderItem> getItemById(Integer id) {
        return repository.findById(id);
    }

    public OrderItem updateItem(
            Integer id,
            OrderItem details) {

        OrderItem item = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order item not found"));

        item.setOrder(details.getOrder());
        item.setProduct(details.getProduct());
        item.setQuantity(details.getQuantity());
        item.setUnitPrice(details.getUnitPrice());
        item.setSubtotal(details.getSubtotal());

        return repository.save(item);
    }

    public void deleteItem(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Order item not found");
        }

        repository.deleteById(id);
    }
}
