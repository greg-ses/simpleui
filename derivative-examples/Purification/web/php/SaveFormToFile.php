<?php
   // Configuration - Your Options
   
   //$allowed_filetypes = array('.gz'); // These will be the types of file that will pass the validation.
   $max_filesize = 10000000; // Maximum filesize in BYTES .
   //TODO: make this settable from the form submit section
   $upload_path = $_POST['uploadPath'];// The place the files will be uploaded to (currently a 'files' directory).
 
   $filename = $_POST['uploadFile'];//$_FILES['uploadedfile']['name']; // Get the name of the file (including file extension).
  
   // Now check the filesize, if it is too large then DIE and inform the user.
   /*
   if(filesize($_FILES['uploadedfile']['tmp_name']) > $max_filesize)
   {
        echo filesize($_FILES['uploadedfile']['tmp_name']);
      die(' The file you attempted to upload is too large.');
   }
	*/
	
   // Check if we can upload to the specified path, if not DIE and inform the user.
   if(!is_writable($upload_path)) {
      die('You cannot upload to path ' . $upload_path . ', please CHMOD it to 777.');
   }
	$myFile = $upload_path . $filename;
	$fh = fopen($myFile, 'w') or die("can't open file");
	fwrite($fh, $_POST['AutoCycleScriptText']);
	fclose($fh);

	
?> 