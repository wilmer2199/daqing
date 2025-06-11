create database fuerzaactiva ; 

use fuerzaactiva ;

    create table inicio (
        id int PRIMARY KEY auto_increment NOT NULL,
        nombre_usuario varchar (100) not null,
        contrasena varchar (200) unique  not null,
        nombre_completo varchar (100) not null);	

    -- esto es para hashear la contraseña de wilmer admin 
    UPDATE inicio
    SET contrasena = '$2b$10$Db1CTVabY4zWXMIcaPBILuNdFa0zmSO.QEy13P0KTpimEZdSx4aTe'
    WHERE id = 4; WHERE nombre_usuario = 'Wilmeradmin';

    ALTER TABLE inicio
    DROP COLUMN fecha; --se borro la columna fecha de la tabla inicio
    describe inicio;  -- este es para ver la tabla
    ALTER TABLE inicio
    DROP COLUMN nombre_completo;
    alter table inicio
    add nombre_completo varchar (40) not null;
    ALTER TABLE inicio
    DROP INDEX contrasena; -- En MySQL, UNIQUE se implementa con un índice.
    -- Añadir la columna 'rol' para diferenciar administradores de clientes
    ALTER TABLE inicio
    ADD COLUMN rol ENUM('Cliente', 'Admin') NOT NULL DEFAULT 'Cliente' AFTER nombre_completo;

    describe inicio; -- los cambios han sido modificado, la comtraseña ya no es unique y se agrego el rol. 


    -- base de datos de fuerza activa modificado

    CREATE TABLE Clientes (
        id INT PRIMARY KEY  AUTO_INCREMENT Not NULL, 
        inicio_id int (11),
        tipo_cliente VARCHAR (150) NOT NULL,
        nombre_contacto VARCHAR(150) NOT NULL,    
        nombre_empresa VARCHAR(150),              
        cedula_rif VARCHAR(20) UNIQUE,            
        email_contacto VARCHAR(100) UNIQUE NOT NULL, 
        telefono_contacto VARCHAR(20),            
        direccion_principal VARCHAR(255),         
        origen_cliente VARCHAR(100),
        descripcion TEXT,               
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        constraint FK_inicio FOREIGN KEY (inicio_id) REFERENCES inicio (id)
        );

   -- agregar columna para identificar el numero de registro de cada usuario 
    ALTER TABLE clientes
    ADD COLUMN numero_registro varchar (40) not null;
    ALTER TABLE clientes
    DROP COLUMN numero_registro;
    ---

    









