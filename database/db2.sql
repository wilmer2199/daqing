create database daqing;

use daqing


        create table inicio (
        id int PRIMARY KEY auto_increment NOT NULL,
        nombre_usuario varchar (100) not null,
        contrasena varchar (200) unique  not null,
        nombre_completo varchar (100) not null,	
        rol ENUM('Cliente', 'Admin') NOT NULL  DEFAULT 'Cliente' );

        INSERT INTO inicio (nombre_usuario, contrasena, nombre_completo, rol)
        VALUES ('wilmeradmin', 'wilmeradmin', 'Wilmer Administrador', 'Admin');

         UPDATE inicio
         SET contrasena = '$2b$10$IaLOu/clgkZh6RbAlaABbOp7AqxPASdsRLFqk1MrypY9RvyWXC21y'
         WHERE id = 2; WHERE nombre_usuario = 'wilmeradmin';



        create table control(
        id INT PRIMARY KEY  AUTO_INCREMENT Not NULL, 
        inicio_id int (11),
        numero_registro varchar (40) Not null,
        nombre_empresa varchar (250),    
        nombre_apellido VARCHAR (150) not null,              
        cedula_rif VARCHAR(20) ,            
        telefono VARCHAR(20), 
        placa_vehiculo VARCHAR(20),          
        hora_entrada VARCHAR(20), 
        hora_salida VARCHAR(20), 
        firma varchar (20),               
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     
        observaciones text,
        constraint FK_inicio FOREIGN KEY (inicio_id) REFERENCES inicio (id));
        

     
       

