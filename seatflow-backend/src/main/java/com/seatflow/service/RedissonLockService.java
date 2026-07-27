package com.seatflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedissonLockService {

    private final RedissonClient redissonClient;

    public <T> T executeWithLock(String lockKey, long waitTimeSec, long leaseTimeSec, Supplier<T> supplier) {
        RLock lock = redissonClient.getLock(lockKey);
        boolean isLocked = false;
        try {
            isLocked = lock.tryLock(waitTimeSec, leaseTimeSec, TimeUnit.SECONDS);
            if (!isLocked) {
                log.warn("Could not acquire lock for key: {}", lockKey);
                throw new IllegalStateException("Hệ thống đang bận xử lý ghế này. Vui lòng thử lại sau giây lát.");
            }
            return supplier.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Lock acquisition interrupted for key: " + lockKey, e);
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
