package com.company.tenant.service;

import com.company.tenant.entity.Tenant;
import com.company.tenant.repository.TenantRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TenantService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        patchPublicTenantsTable();
        patchAllTenantSchemas();
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }
    
    public Tenant getTenantByTenantId(String tenantId) {
        return tenantRepository.findByTenantId(tenantId).orElse(null);
    }

    @Transactional
    public Tenant registerTenant(Tenant tenantRequest) {
        // Ensure master metadata table has all required columns (Hibernate update sometimes fails)
        patchPublicTenantsTable();

        try {
            String companyName = tenantRequest.getCompanyName();
            // Generate a valid schema name from company name
            String tenantId = companyName.toLowerCase().replaceAll("[^a-z0-9]", "_");
            String schemaName = "tenant_" + tenantId;

            System.out.println("Registering tenant: " + tenantId + " with schema: " + schemaName);

            if (tenantRepository.existsByTenantId(tenantId)) {
                throw new RuntimeException("Tenant already exists: " + tenantId);
            }

            // 1. Save tenant metadata in master schema
            Tenant tenant = new Tenant();
            tenant.setTenantId(tenantId);
            tenant.setCompanyName(companyName);
            tenant.setSchemaName(schemaName);
            tenant.setStatus("PROVISIONING");
            
            // Set Zoho-style rich metadata
            tenant.setIndustry(tenantRequest.getIndustry());
            tenant.setCompanySize(tenantRequest.getCompanySize());
            tenant.setEmployeeCount(tenantRequest.getEmployeeCount());
            tenant.setFreelancerCount(tenantRequest.getFreelancerCount());
            tenant.setWebsite(tenantRequest.getWebsite());
            tenant.setDescription(tenantRequest.getDescription());
            
            // Set new comprehensive profile fields
            tenant.setServicesOffered(tenantRequest.getServicesOffered());
            tenant.setCountry(tenantRequest.getCountry());
            tenant.setCity(tenantRequest.getCity());
            tenant.setAddress(tenantRequest.getAddress());
            tenant.setContactEmail(tenantRequest.getContactEmail());
            tenant.setContactPhone(tenantRequest.getContactPhone());
            tenant.setFoundingYear(tenantRequest.getFoundingYear());
            tenant.setRevenueRange(tenantRequest.getRevenueRange());
            tenant.setCreatedAt(java.time.LocalDateTime.now());
            tenant.setUpdatedAt(java.time.LocalDateTime.now());

            tenant = tenantRepository.save(tenant);
            System.out.println("Saved rich tenant metadata to public schema");

            // 2. Provision Physical Schema
            provisionSchema(schemaName);

            // 3. Mark as active
            tenant.setStatus("ACTIVE");
            tenant.setUpdatedAt(java.time.LocalDateTime.now());
            return tenantRepository.save(tenant);
        } catch (Exception e) {
            System.err.println("FATAL ERROR in registerTenant: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void patchPublicTenantsTable() {
        try {
            System.out.println("Patching public.tenants table to ensure all metadata columns exist...");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS industry VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS company_size VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS freelancer_count INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS website VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS description TEXT");
            
            // New comprehensive profile fields
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS services_offered TEXT");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS country VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS city VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address TEXT");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS founding_year INTEGER");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS revenue_range VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            
            System.out.println("Public.tenants table patching completed successfully.");
        } catch (Exception e) {
            System.err.println("Note: Manual patch for public.tenants table failed or columns already exist: " + e.getMessage());
        }
    }

    private void provisionSchema(String schemaName) {
        try {
            // Create the schema
            jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + schemaName);
            System.out.println("Schema created: " + schemaName);

            // Create standard tables in the new schema
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".users (" +
                    "id SERIAL PRIMARY KEY, " +
                    "email VARCHAR(255) UNIQUE NOT NULL, " +
                    "password VARCHAR(255) NOT NULL, " +
                    "role VARCHAR(50) DEFAULT 'USER')");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".services (" +
                    "id SERIAL PRIMARY KEY, " +
                    "service_name VARCHAR(255) NOT NULL, " +
                    "service_type VARCHAR(100) NOT NULL, " +
                    "description TEXT, " +
                    "status VARCHAR(50) DEFAULT 'PENDING', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            // Create employees table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".employees (" +
                    "id SERIAL PRIMARY KEY, " +
                    "name VARCHAR(255) NOT NULL, " +
                    "email VARCHAR(255) UNIQUE NOT NULL, " +
                    "position VARCHAR(100), " +
                    "department VARCHAR(100), " +
                    "salary DECIMAL(10,2), " +
                    "hire_date DATE, " +
                    "status VARCHAR(50) DEFAULT 'ACTIVE', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            // Create projects table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".projects (" +
                    "id SERIAL PRIMARY KEY, " +
                    "project_name VARCHAR(255) NOT NULL, " +
                    "service_id INTEGER REFERENCES " + schemaName + ".services(id), " +
                    "status VARCHAR(50) DEFAULT 'PLANNING', " +
                    "budget DECIMAL(10,2), " +
                    "spent DECIMAL(10,2) DEFAULT 0, " +
                    "start_date DATE, " +
                    "end_date DATE, " +
                    "description TEXT, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            System.out.println("Successfully provisioned all tables (users, services, employees, projects) in schema: " + schemaName);
        } catch (Exception e) {
            System.err.println("ERROR during schema provisioning for: " + schemaName);
            e.printStackTrace();
            throw new RuntimeException("Schema provisioning failed: " + e.getMessage());
        }
    }
    private void patchAllTenantSchemas() {
        try {
            List<Tenant> tenants = tenantRepository.findAll();
            for (Tenant tenant : tenants) {
                String schemaName = "tenant_" + tenant.getTenantId().toLowerCase().replace("-", "_");
                System.out.println("Patching schema for tenant: " + schemaName);
                
                // Ensure services table exists (for older tenants)
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".services (" +
                        "id SERIAL PRIMARY KEY, " +
                        "service_name VARCHAR(255) NOT NULL, " +
                        "service_type VARCHAR(100) NOT NULL, " +
                        "description TEXT, " +
                        "status VARCHAR(50) DEFAULT 'PENDING', " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

                // Ensure employees table exists
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".employees (" +
                        "id SERIAL PRIMARY KEY, " +
                        "name VARCHAR(255) NOT NULL, " +
                        "email VARCHAR(255) UNIQUE NOT NULL, " +
                        "position VARCHAR(100), " +
                        "department VARCHAR(100), " +
                        "salary DECIMAL(10,2), " +
                        "hire_date DATE, " +
                        "status VARCHAR(50) DEFAULT 'ACTIVE', " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

                // Ensure projects table exists
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".projects (" +
                        "id SERIAL PRIMARY KEY, " +
                        "project_name VARCHAR(255) NOT NULL, " +
                        "service_id INTEGER REFERENCES " + schemaName + ".services(id), " +
                        "status VARCHAR(50) DEFAULT 'PLANNING', " +
                        "budget DECIMAL(10,2), " +
                        "spent DECIMAL(10,2) DEFAULT 0, " +
                        "start_date DATE, " +
                        "end_date DATE, " +
                        "description TEXT, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            }
            System.out.println("All tenant schemas patched successfully.");
        } catch (Exception e) {
            System.err.println("Note: Batch schema patching encountered issues: " + e.getMessage());
        }
    }
}
