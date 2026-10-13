package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.CustomerOrder;
import com.hcl.RetailManagement.repository.CustomerOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerOrderService {

    private final CustomerOrderRepository repository;

    public CustomerOrderService(
            CustomerOrderRepository repository) {

        this.repository = repository;
    }

    public CustomerOrder createOrder(CustomerOrder order) {
        return repository.save(order);
    }

    public List<CustomerOrder> getAllOrders() {
        return repository.findAll();
    }

    public Optional<CustomerOrder> getOrderById(Integer id) {
        return repository.findById(id);
    }

    public CustomerOrder updateOrder(
            Integer id,
            CustomerOrder details) {

        CustomerOrder order = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setWarehouse(details.getWarehouse());
        order.setCustomerName(details.getCustomerName());
        order.setCustomerEmail(details.getCustomerEmail());
        order.setCustomerPhone(details.getCustomerPhone());
        order.setShippingAddress(details.getShippingAddress());
        order.setStatus(details.getStatus());
        order.setTotalAmount(details.getTotalAmount());

        return repository.save(order);
    }

    public void deleteOrder(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Order not found");
        }

        repository.deleteById(id);
    }
}
