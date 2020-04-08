<?php

function getCfgVar($key) {
    $value = get_cfg_var($key);
    if ($value == false) {
        $value = "<span class='empty'>No Value</span>";
    }
    
    return $value;
}

?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>PHP: Check session-related Apache and PHP Configuration Settings</title>

    <link rel="shortcut icon" href="favicon.ico">

    <!--
    <link rel="stylesheet" type="text/css" href="http://php.net/cached.php?t=1421837618&amp;f=/fonts/Fira/fira.css" media="screen">
    <link rel="stylesheet" type="text/css" href="http://php.net/cached.php?t=1421837618&amp;f=/fonts/Font-Awesome/css/fontello.css" media="screen">
    <link rel="stylesheet" type="text/css" href="http://php.net/cached.php?t=1478800802&amp;f=/styles/theme-base.css" media="screen">
    <link rel="stylesheet" type="text/css" href="http://php.net/cached.php?t=1449787206&amp;f=/styles/theme-medium.css" media="screen">
    -->

    <style type='text/css'>
        body {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }

        .empty {
            font-style: italic;
            font-size: smaller;
            color: deepskyblue;
        }

        .caption {
            font-size: x-large;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-weight: bold;
            horiz-align: left;
        }

        table {
            border: 1px solid purple;
            border-collapse: collapse;
            horiz-align: left;
            background-color: lightgray;
        }

        thead {
            border-collapse; collapse;
            horiz-align: left;
        }

        th {
            background-color: darkgray;
            border: 1px solid black;
            border-collapse: collapse;
            horiz-align: left;
        }

        tr:nth-child(even) {
            background-color: lightgray;
        }

        tr:nth-child(odd){
            background-color: whitesmoke;
        }

        td {
            border: 1px solid black;
            border-collapse: collapse;
        }

    </style>

</head>

<body>
<h2>Runtime Configuration</h2>
<p>
    The behaviour of these functions is affected by settings in <var class="filename">php.ini</var>.
</p>

<div class="caption">Session configuration options</div>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Current_Value</th>
            <th>Default_Value</th>
            <th>Changeable</th>
            <th>Changelog</th>
        </tr>
    </thead>

    <tbody>

        <tr>
            <td>session.auto_start</td>
            <td id="session.auto_start"><?php echo getCfgVar("session.auto_start"); ?></td>
            <td>0</td>
            <td>PHP_INI_PERDIR</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.bug_compat_42</td>
            <td id="session.bug_compat_42"><?php echo getCfgVar("session.bug_compat_42"); ?></td>
            <td>1</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 4.3.0. Removed in PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.bug_compat_warn</td>
            <td id="session.bug_compat_warn"><?php echo getCfgVar("session.bug_compat_warn"); ?></td>
            <td>1</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 4.3.0. Removed in PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.cache_expire</td>
            <td id="session.cache_expire"><?php echo getCfgVar("session.cache_expire"); ?></td>
            <td>180</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.cache_limiter</td>
            <td id="session.cache_limiter"><?php echo getCfgVar("session.cache_limiter"); ?></td>
            <td>nocache</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.cookie_domain</td>
            <td id="session.cookie_domain"><?php echo getCfgVar("session.cookie_domain"); ?></td>
            <td><span class="empty">No Value</span></td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.cookie_httponly</td>
            <td id="session.cookie_httponly"><?php echo getCfgVar("session.cookie_httponly"); ?></td>
            <td><span class="empty">No Value</span></td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 5.2.0.</td>
        </tr>

        <tr>
            <td>session.cookie_lifetime</td>
            <td id="session.cookie_lifetime"><?php echo getCfgVar("session.cookie_lifetime"); ?></td>
            <td>0</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.cookie_path</td>
            <td id="session.cookie_path"><?php echo getCfgVar("session.cookie_path"); ?></td>
            <td>/</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.cookie_secure</td>
            <td id="session.cookie_secure"><?php echo getCfgVar("session.cookie_secure"); ?></td>
            <td><span class="empty">No Value</span></td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 4.0.4.</td>
        </tr>

        <tr>
            <td>session.entropy_file</td>
            <td id="session.entropy_file"><?php echo getCfgVar("session.entropy_file"); ?></td>
            <td><span class="empty">No Value</span></td>
            <td>PHP_INI_ALL</td>
            <td>Removed in PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.entropy_length</td>
            <td id="session.entropy_length"><?php echo getCfgVar("session.entropy_length"); ?></td>
            <td>0</td>
            <td>PHP_INI_ALL</td>
            <td>Removed in PHP 7.1.0</td>
        </tr>

        <tr>
            <td>session.gc_divisor</td>
            <td id="session.gc_divisor"><?php echo getCfgVar("session.gc_divisor"); ?></td>
            <td>100</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 4.3.2.</td>
        </tr>

        <tr>
            <td>session.gc_maxlifetime</td>
            <td id="session.gc_maxlifetime"><?php echo getCfgVar("session.gc_maxlifetime"); ?></td>
            <td>1440</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.gc_probability</td>
            <td id="session.gc_probability"><?php echo getCfgVar("session.gc_probability"); ?></td>
            <td>1</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.hash_bits_per_character</td>
            <td id="session.hash_bits_per_character"><?php echo getCfgVar("session.hash_bits_per_character"); ?></td>
            <td>4</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 5.0.0. Removed in PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.hash_function</td>
            <td id="session.hash_function"><?php echo getCfgVar("session.hash_function"); ?></td>
            <td>0</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 5.0.0. Removed in PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.lazy_write</td>
            <td id="session.lazy_write"><?php echo getCfgVar("session.lazy_write"); ?></td>
            <td>1</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 7.0.0.</td>
        </tr>

        <tr>
            <td>session.name</td>
            <td id="session.name"><?php echo getCfgVar("session.name"); ?></td>
            <td>PHPSESSID</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.referer_check</td>
            <td id="session.referer_check"><?php echo getCfgVar("session.referer_check"); ?></td>
            <td><span class="empty">No Value</span></td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.save_handler</td>
            <td id="session.save_handler"><?php echo getCfgVar("session.save_handler"); ?></td>
            <td>files</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.save_path</td>
            <td id="session.save_path"><?php echo getCfgVar("session.save_path"); ?></td>
            <td><span class="empty">No Value</span></td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.serialize_handler</td>
            <td id="session.serialize_handler"><?php echo getCfgVar("session.serialize_handler"); ?></td>
            <td>php</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.sid_bits_per_character</td>
            <td id="session.sid_bits_per_character"><?php echo getCfgVar("session.sid_bits_per_character"); ?></td>
            <td>5</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.sid_length</td>
            <td id="session.sid_length"><?php echo getCfgVar("session.sid_length"); ?></td>
            <td>32</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.trans_sid_hosts</td>
            <td id="session.trans_sid_hosts"><?php echo getCfgVar("session.trans_sid_hosts"); ?></td>
            <td><em>$_SERVER[&#039;HTTP_HOST&#039;]</em></td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.trans_sid_tags</td>
            <td id="session.trans_sid_tags"><?php echo getCfgVar("session.trans_sid_tags"); ?></td>
            <td>a=href,area=href,frame=src,form=</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 7.1.0.</td>
        </tr>

        <tr>
            <td>session.upload_progress.cleanup</td>
            <td id="session.upload_progress.cleanup"><?php echo getCfgVar("session.upload_progress.cleanup"); ?></td>
            <td>1</td>
            <td>PHP_INI_PERDIR</td>
            <td>Available since PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.upload_progress.enabled</td>
            <td id="session.upload_progress.enabled"><?php echo getCfgVar("session.upload_progress.enabled"); ?></td>
            <td>1</td>
            <td>PHP_INI_PERDIR</td>
            <td>Available since PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.upload_progress.freq</td>
            <td id="session.upload_progress.freq"><?php echo getCfgVar("session.upload_progress.freq"); ?></td>
            <td>1%</td>
            <td>PHP_INI_PERDIR</td>
            <td>Available since PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.upload_progress.min_freq</td>
            <td id="session.upload_progress.min_freq"><?php echo getCfgVar("session.upload_progress.min_freq"); ?></td>
            <td>1</td>
            <td>PHP_INI_PERDIR</td>
            <td>Available since PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.upload_progress.name</td>
            <td id="session.upload_progress.name"><?php echo getCfgVar("session.upload_progress.name"); ?></td>
            <td>PHP_SESSION_UPLOAD_PROGRESS</td>
            <td>PHP_INI_PERDIR</td>
            <td>Available since PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.upload_progress.prefix</td>
            <td id="session.upload_progress.prefix"><?php echo getCfgVar("session.upload_progress.prefix"); ?></td>
            <td>upload_progress_</td>
            <td>PHP_INI_PERDIR</td>
            <td>Available since PHP 5.4.0.</td>
        </tr>

        <tr>
            <td>session.use_cookies</td>
            <td id="session.use_cookies"><?php echo getCfgVar("session.use_cookies"); ?></td>
            <td>1</td>
            <td>PHP_INI_ALL</td>
            <td>&nbsp;</td>
        </tr>

        <tr>
            <td>session.use_only_cookies</td>
            <td id="session.use_only_cookies"><?php echo getCfgVar("session.use_only_cookies"); ?></td>
            <td>1</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 4.3.0.</td>
        </tr>

        <tr>
            <td>session.use_strict_mode</td>
            <td id="session.use_strict_mode"><?php echo getCfgVar("session.use_strict_mode"); ?></td>
            <td>0</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 5.5.2.</td>
        </tr>

        <tr>
            <td>session.use_trans_sid</td>
            <td id="session.use_trans_sid"><?php echo getCfgVar("session.use_trans_sid"); ?></td>
            <td>0</td>
            <td>PHP_INI_ALL</td>
            <td>PHP_INI_ALL in PHP &lt;= 4.2.3. PHP_INI_PERDIR in PHP &lt; 5. Available since PHP 4.0.3.</td>
        </tr>

        <tr>
            <td>url_rewriter.tags</td>
            <td id="url_rewriter.tags"><?php echo getCfgVar("url_rewriter.tags"); ?></td>
            <td>a=href,area=href,frame=src,form=</td>
            <td>PHP_INI_ALL</td>
            <td>Available since PHP 4.0.4. Since PHP 7.1.0, this INI is no longer used by session.</td>
        </tr>

        </tbody>

    </table>

    <p>
    For further details and definitions of the
    PHP_INI_* modes, see the <a href="configuration.changes.modes.php" class="xref">Where a configuration setting may be set</a>.
    </p>

    <p class="para">
    The session management system supports a number of configuration
    options which you can place in your <var class="filename">php.ini</var> file. We will give a
    short overview.

        <dl>

        <dt id="ini.session.save-handler">
            <code class="parameter">session.save_handler</code>
            <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
        </dt>

        <dd>

    <span class="simpara">
     <em>session.save_handler</em> defines the name of the
     handler which is used for storing and retrieving data
     associated with a session. Defaults to
     <em>files</em>. Note that individual extensions may register
     their own <em>save_handler</em>s; registered handlers can be
     obtained on a per-installation basis by referring to
     <span class="function"><a href="function.phpinfo.php" class="function">phpinfo()</a></span>. See also
     <span class="function"><a href="function.session-set-save-handler.php" class="function">session_set_save_handler()</a></span>.
    </span>
                    </dd>




                    <dt id="ini.session.save-path">
                        <code class="parameter">session.save_path</code>
                        <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
                    </dt>

                    <dd>

    <span class="simpara">
     <em>session.save_path</em> defines the argument which
     is passed to the save handler. If you choose the default files
     handler, this is the path where the files are created. See also
     <span class="function"><a href="function.session-save-path.php" class="function">session_save_path()</a></span>.
    </span>
            <p class="para">
                There is an optional <em>N</em> argument to this directive that determines
                the number of directory levels your session files will be spread
                around in.  For example, setting to <em>&#039;5;/tmp&#039;</em>
                may end up creating a session file and location like
                <em>/tmp/4/b/1/e/3/sess_4b1e384ad74619bd212e236e52a5a174If
                </em>.  In order to use <em>N</em> you must create all of these
                directories before use.  A small shell script exists in
                <var class="filename">ext/session</var> to do this, it&#039;s called
                <var class="filename">mod_files.sh</var>, with a Windows version called
                <var class="filename">mod_files.bat</var>.  Also note that if <em>N</em> is
                used and greater than 0 then automatic garbage collection will
                not be performed, see a copy of <var class="filename">php.ini</var> for further
                information.  Also, if you use <em>N</em>, be sure to surround
                <em>session.save_path</em> in
                &quot;quotes&quot; because the separator (<em>;</em>) is
                also used for comments in <var class="filename">php.ini</var>.
            </p>
        <p class="para">
            The file storage module creates files using mode 600 by default.
            This default can be changed with the optional <em>MODE</em> argument:
            <em>N;MODE;/path</em> where <em>MODE</em> is the octal
            representation of the mode.
            Setting <em>MODE</em> does not affect the process umask.
        </p>
        <div class="warning"><strong class="warning">Warning</strong>
            <p class="para">
                If you leave this set to a world-readable directory, such as
                <var class="filename">/tmp</var> (the default), other users on the
                server may be able to hijack sessions by getting the list of
                files in that directory.
            </p>
        </div>
        <div class="caution"><strong class="caution">Caution</strong>
            <p class="para">
                When using the optional directory level argument <em>N</em>,
                as described above, note that using a value higher than 1 or 2 is
                inappropriate for most sites due to the large number of directories
                required: for example, a value of 3 implies that <em>64^3</em>
                directories exist on the filesystem, which can result in a lot of wasted
                space and inodes.
            </p>
            <p class="para">
                Only use <em>N</em> greater than 2 if you are absolutely
                certain that your site is large enough to require it.
            </p>
        </div>
    <blockquote class="note"><p><strong class="note">Note</strong>:
            <span class="simpara">
      Prior to PHP 4.3.6, Windows users had to change this variable in order
      to use PHP&#039;s session functions. A valid path must be specified, e.g.:
      <var class="filename">c:/temp</var>.
     </span>
                </p></blockquote>
            </dd>




            <dt id="ini.session.name">
                <code class="parameter">session.name</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.name</em> specifies the name of the
     session which is used as cookie name. It should only contain
     alphanumeric characters. Defaults to <em>PHPSESSID</em>.
     See also <span class="function"><a href="function.session-name.php" class="function">session_name()</a></span>.
    </span>
            </dd>




            <dt id="ini.session.auto-start">
                <code class="parameter">session.auto_start</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.auto_start</em> specifies whether the
     session module starts a session automatically on request
     startup. Defaults to <em>0</em> (disabled).
    </span>
            </dd>




            <dt id="ini.session.serialize-handler">
                <code class="parameter">session.serialize_handler</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.serialize_handler</em> defines the name of
     the handler which is used to serialize/deserialize data. PHP
     serialize format (name <em>php_serialize</em>), PHP
     internal formats (name <em>php</em> and
     <em>php_binary</em>) and WDDX are supported (name
     <em>wddx</em>). WDDX is only available, if PHP is
     compiled with <a href="ref.wddx.php" class="link">WDDX
     support</a>. <em>php_serialize</em> is available
     from PHP 5.5.4. <em>php_serialize</em> uses plain
     serialize/unserialize function internally and does not have
     limitations that <em>php</em>
     and <em>php_binary</em> have. Older serialize handlers
     cannot store numeric index nor string index contains special
     characters (<em>|</em> and <em>!</em>) in
     $_SESSION. Use <em>php_serialize</em> to avoid numeric
     index or special character errors at script shutdown. Defaults
     to <em>php</em>.
    </span>
            </dd>




            <dt id="ini.session.gc-probability">
                <code class="parameter">session.gc_probability</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.gc_probability</em> in conjunction with
     <em>session.gc_divisor</em> is used to manage probability
     that the gc (garbage collection) routine is started.
     Defaults to <em>1</em>. See <a href="session.configuration.php#ini.session.gc-divisor" class="link">session.gc_divisor</a> for details.
    </span>
            </dd>




            <dt id="ini.session.gc-divisor">
                <code class="parameter">session.gc_divisor</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.gc_divisor</em> coupled with
     <em>session.gc_probability</em> defines the probability
     that the gc (garbage collection) process is started on every session
     initialization.
     The probability is calculated by using gc_probability/gc_divisor,
     e.g. 1/100 means there is a 1% chance that the GC process starts
     on each request.
     <em>session.gc_divisor</em> defaults to <em>100</em>.
    </span>
            </dd>




            <dt id="ini.session.gc-maxlifetime">
                <code class="parameter">session.gc_maxlifetime</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.gc_maxlifetime</em> specifies the number
     of seconds after which data will be seen as &#039;garbage&#039; and
     potentially cleaned up. Garbage collection may occur during session start
     (depending on <a href="session.configuration.php#ini.session.gc-probability" class="link">session.gc_probability</a> and
     <a href="session.configuration.php#ini.session.gc-divisor" class="link">session.gc_divisor</a>).
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      If different scripts have different values of
      <em>session.gc_maxlifetime</em> but share the same place for
      storing the session data then the script with the minimum value will be
      cleaning the data. In this case, use this directive together with <a href="session.configuration.php#ini.session.save-path" class="link">session.save_path</a>.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.referer-check">
                <code class="parameter">session.referer_check</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.referer_check</em> contains the
     substring you want to check each HTTP Referer for. If the
     Referer was sent by the client and the substring was not
     found, the embedded session id will be marked as invalid.
     Defaults to the empty string.
    </span>
            </dd>




            <dt id="ini.session.entropy-file">
                <code class="parameter">session.entropy_file</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.entropy_file</em> gives a path to an
     external resource (file) which will be used as an additional
     entropy source in the session id creation process. Examples are
     <em>/dev/random</em> or <em>/dev/urandom</em>
     which are available on many Unix systems.
    </span>
                <span class="simpara">
     This feature is supported on Windows since PHP 5.3.3. Setting
     <em>session.entropy_length</em> to a non zero value
     will make PHP use the Windows Random API as entropy source.
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      Removed in PHP 7.1.0.
     </span>
                        <span class="simpara">
      As of PHP 5.4.0 <em>session.entropy_file</em> defaults
      to <em>/dev/urandom</em> or <em>/dev/arandom</em>
      if it is available. In PHP 5.3.0 this directive is left empty by default.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.entropy-length">
                <code class="parameter">session.entropy_length</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.entropy_length</em> specifies the number
     of bytes which will be read from the file specified
     above. Defaults to <em>32</em>.
    </span>
                <span class="simpara">
      Removed in PHP 7.1.0.
    </span>
            </dd>




            <dt id="ini.session.use-strict-mode">
                <code class="parameter">session.use_strict_mode</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.use_strict_mode</em> specifies whether the
     module will use strict session id mode. If this mode is enabled,
     the module does not accept uninitialized session ID. If uninitialized
     session ID is sent from browser, new session ID is sent to browser.
     Applications are protected from session fixation via session adoption
     with strict mode.
     Defaults to <em>0</em> (disabled).
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
     Enabling <em>session.use_strict_mode</em> is mandatory for
     general session security. All sites are advised to enable this. See
     <span class="function"><a href="function.session-create-id.php" class="function">session_create_id()</a></span> example code for more details.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.use-cookies">
                <code class="parameter">session.use_cookies</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.use_cookies</em> specifies whether the
     module will use cookies to store the session id on the client
     side. Defaults to <em>1</em> (enabled).
    </span>
            </dd>




            <dt id="ini.session.use-only-cookies">
                <code class="parameter">session.use_only_cookies</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.use_only_cookies</em> specifies whether
     the module will <em class="emphasis">only</em> use
     cookies to store the session id on the client side.
     Enabling this setting prevents attacks involved passing session
     ids in URLs. This setting was added in PHP 4.3.0.
     Defaults to <em>1</em> (enabled) since PHP 5.3.0.
    </span>
            </dd>





            <dt id="ini.session.cookie-lifetime">
                <code class="parameter">session.cookie_lifetime</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.cookie_lifetime</em> specifies the lifetime of
     the cookie in seconds which is sent to the browser. The value 0
     means &quot;until the browser is closed.&quot; Defaults to
     <em>0</em>. See also
     <span class="function"><a href="function.session-get-cookie-params.php" class="function">session_get_cookie_params()</a></span> and
     <span class="function"><a href="function.session-set-cookie-params.php" class="function">session_set_cookie_params()</a></span>.
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      The expiration timestamp is set relative to the server time, which is
      not necessarily the same as the time in the client&#039;s browser.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.cookie-path">
                <code class="parameter">session.cookie_path</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.cookie_path</em> specifies path to set
     in the session cookie. Defaults to <em>/</em>. See also
     <span class="function"><a href="function.session-get-cookie-params.php" class="function">session_get_cookie_params()</a></span> and
     <span class="function"><a href="function.session-set-cookie-params.php" class="function">session_set_cookie_params()</a></span>.
    </span>
            </dd>




            <dt id="ini.session.cookie-domain">
                <code class="parameter">session.cookie_domain</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.cookie_domain</em> specifies the domain to
     set in the session cookie. Default is none at all meaning the host name of
     the server which generated the cookie according to cookies specification.
     See also <span class="function"><a href="function.session-get-cookie-params.php" class="function">session_get_cookie_params()</a></span> and
     <span class="function"><a href="function.session-set-cookie-params.php" class="function">session_set_cookie_params()</a></span>.
    </span>
            </dd>




            <dt id="ini.session.cookie-secure">
                <code class="parameter">session.cookie_secure</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.cookie_secure</em> specifies whether
     cookies should only be sent over secure connections. Defaults to
     <em>off</em>.
     This setting was added in PHP 4.0.4. See also
     <span class="function"><a href="function.session-get-cookie-params.php" class="function">session_get_cookie_params()</a></span> and
     <span class="function"><a href="function.session-set-cookie-params.php" class="function">session_set_cookie_params()</a></span>.
    </span>
            </dd>




            <dt id="ini.session.cookie-httponly">
                <code class="parameter">session.cookie_httponly</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     Marks the cookie as accessible only through the HTTP protocol. This means
     that the cookie won&#039;t be accessible by scripting languages, such as
     JavaScript. This setting can effectively help to reduce identity theft
     through XSS attacks (although it is not supported by all browsers).
    </span>
            </dd>




            <dt id="ini.session.cache-limiter">
                <code class="parameter">session.cache_limiter</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.cache_limiter</em> specifies the cache
     control method used for session pages.
     It may be one of the following values:
     <em>nocache</em>, <em>private</em>,
     <em>private_no_expire</em>, or <em>public</em>.
     Defaults to <em>nocache</em>. See also the
     <span class="function"><a href="function.session-cache-limiter.php" class="function">session_cache_limiter()</a></span> documentation for
     information about what these values mean.
    </span>
            </dd>





            <dt id="ini.session.cache-expire">
                <code class="parameter">session.cache_expire</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.cache_expire</em> specifies time-to-live
     for cached session pages in minutes, this has no effect for
     nocache limiter. Defaults to <em>180</em>. See also
     <span class="function"><a href="function.session-cache-expire.php" class="function">session_cache_expire()</a></span>.
    </span>
            </dd>




            <dt id="ini.session.use-trans-sid">
                <code class="parameter">session.use_trans_sid</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.use_trans_sid</em> whether transparent
     sid support is enabled or not. Defaults to
     <em>0</em> (disabled).
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      URL based session management has additional security risks
      compared to cookie based session management. Users may send
      a URL that contains an active session ID to their friends by
      email or users may save a URL that contains a session ID to
      their bookmarks and access your site with the same session ID
      always, for example.
     </span>
                        <span class="simpara">
      Since PHP 7.1.0, full URL path, e.g. https://php.net/, is
      handled by trans sid feature. Previous PHP handled relative
      URL path only. Rewrite target hosts are defined by <a href="session.configuration.php#ini.session.trans-sid-hosts" class="link">session.trans_sid_hosts</a>.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.trans-sid-tags">
                <code class="parameter">session.trans_sid_tags</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.trans_sid_tags</em> specifies which HTML tags
     are rewritten to include session id when transparent sid support
     is enabled. Defaults to
     <em>a=href,area=href,frame=src,input=src,form=</em>
    </span>
                <span class="simpara">
     <em>form</em> is special tag. <em>&lt;input hidden=&quot;session_id&quot; name=&quot;session_name&quot;&gt;</em>
     is added as form variable.
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      Before PHP 7.1.0, <a href="outcontrol.configuration.php#ini.url-rewriter.tags" class="link">url_rewriter.tags</a>
      was used for this purpose. Since PHP 7.1.0, <em>fieldset</em>
      is no longer considered as special tag.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.trans-sid-hosts">
                <code class="parameter">session.trans_sid_hosts</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.trans_sid_hosts</em> specifies which hosts
     are rewritten to include session id when transparent sid support
     is enabled. Defaults to <em>$_SERVER[&#039;HTTP_HOST&#039;]</em>
     Multiple hosts can be specified by &quot;,&quot;, no space is allowed
     between hosts. e.g. <em>php.net,wiki.php.net,bugs.php.net</em>
    </span>
            </dd>




            <dt id="ini.session.bug-compat-42">
                <code class="parameter">session.bug_compat_42</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     PHP versions 4.2.3 and lower have an undocumented feature/bug that
     allows you to initialize a session variable in the global scope,
     albeit <a href="ini.core.php#ini.register-globals" class="link">register_globals</a>
     is disabled.  PHP 4.3.0 and later will warn you, if this feature is
     used, and if <a href="session.configuration.php#ini.session.bug-compat-warn" class="link">
     session.bug_compat_warn</a> is also enabled.  This feature/bug can be
     disabled by disabling this directive.
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      Removed in PHP 5.4.0.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.bug-compat-warn">
                <code class="parameter">session.bug_compat_warn</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     PHP versions 4.2.3 and lower have an undocumented feature/bug that
     allows you to initialize a session variable in the global scope,
     albeit <a href="ini.core.php#ini.register-globals" class="link">register_globals</a>
     is disabled.  PHP 4.3.0 and later will warn you, if this feature is
     used by enabling both
     <a href="session.configuration.php#ini.session.bug-compat-42" class="link">session.bug_compat_42</a>
     and <a href="session.configuration.php#ini.session.bug-compat-warn" class="link">
     session.bug_compat_warn</a>.
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      Removed in PHP 5.4.0.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.sid-length">
                <code class="parameter">session.sid_length</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.sid_length</em> allows you to specify the
     length of session ID string. Session ID length can be between 22
     to 256.
    </span>
                <span class="simpara">
     The default is 32. If you need compatibility you may specify 32,
     40, etc. Longer session ID is harder to guess. At least 32 chars
     is recommended.
    </span>
                <p class="para">
                    Compatibility Note: Use 32 for
                    <em>session.hash_func</em>=0 (MD5) and
                    <em>session.hash_bits_per_character</em>=4,
                    <em>session.hash_func</em>=1 (SHA1) and
                    <em>session.hash_bits_per_character</em>=6. Use 26 for
                    <em>session.hash_func</em>=0 (MD5) and
                    <em>session.hash_bits_per_character</em>=5. Use 22 for
                    <em>session.hash_func</em>=0 (MD5) and
                    <em>session.hash_bits_per_character</em>=6. You must
                    configure INI values to have at least 128 bits in session ID. Do
                    not forget set appropriate value to
                    <em>session.sid_bits_per_character</em>, otherwise you
                    will have weaker session ID.
                </p>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      This setting is introduced in PHP 7.1.0.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.sid-bits-per-character">
                <code class="parameter">session.sid_bits_per_character</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.sid_per_character</em> allows you to specify the
     number of bits in encoded session ID character. The possible values are
     &#039;4&#039; (0-9, a-f), &#039;5&#039; (0-9, a-v), and &#039;6&#039; (0-9, a-z, A-Z, &quot;-&quot;, &quot;,&quot;).
    </span>
                <span class="simpara">
     The default is 4. The more bits results in stronger session ID. 5 is
     recommended value for most environments.
    </span>
                <p class="para">
                </p>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      This setting is introduced in PHP 7.1.0.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.hash-function">
                <code class="parameter">session.hash_function</code>
                <span class="type"><a href="language.pseudo-types.php#language.types.mixed" class="type mixed">mixed</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.hash_function</em> allows you to specify the hash
     algorithm used to generate the session IDs. &#039;0&#039; means MD5 (128 bits) and
     &#039;1&#039; means SHA-1 (160 bits).
    </span>
                <p class="para">
                    Since PHP 5.3.0 it is also possible to specify any of the algorithms
                    provided by the <a href="ref.hash.php" class="link">hash extension</a> (if it is
                    available), like <em>sha512</em> or
                    <em>whirlpool</em>. A complete list of supported algorithms can
                    be obtained with the <span class="function"><a href="function.hash-algos.php" class="function">hash_algos()</a></span> function.
                </p>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      This setting was introduced in PHP 5. Removed in PHP 7.1.0.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.hash-bits-per-character">
                <code class="parameter">session.hash_bits_per_character</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.hash_bits_per_character</em> allows you to define
     how many bits are stored in each character when converting the binary
     hash data to something readable. The possible values are &#039;4&#039; (0-9, a-f),
     &#039;5&#039; (0-9, a-v), and &#039;6&#039; (0-9, a-z, A-Z, &quot;-&quot;, &quot;,&quot;).
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      This was introduced in PHP 5. Removed in PHP 7.1.0.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.upload-progress.enabled">
                <code class="parameter">session.upload_progress.enabled</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     Enables upload progress tracking, populating the <var class="varname"><var class="varname"><a href="reserved.variables.session.php" class="classname">$_SESSION</a></var></var> variable.
     Defaults to 1, enabled.
    </span>
            </dd>




            <dt id="ini.session.upload-progress.cleanup">
                <code class="parameter">session.upload_progress.cleanup</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     Cleanup the progress information as soon as all POST data has been read
     (i.e. upload completed). Defaults to 1, enabled.
    </span>
                <blockquote class="note"><p><strong class="note">Note</strong>:
                        <span class="simpara">
      It is highly recommended to keep this feature enabled.
     </span>
                    </p></blockquote>
            </dd>




            <dt id="ini.session.upload-progress.prefix">
                <code class="parameter">session.upload_progress.prefix</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     A prefix used for the upload progress key in the <var class="varname"><var class="varname"><a href="reserved.variables.session.php" class="classname">$_SESSION</a></var></var>.
     This key will be concatenated with the value of
     <em>$_POST[ini_get(&quot;session.upload_progress.name&quot;)]</em> to
     provide a unique index.
    </span>
                <span class="simpara">
     Defaults to &quot;upload_progress_&quot;.
    </span>
            </dd>




            <dt id="ini.session.upload-progress.name">
                <code class="parameter">session.upload_progress.name</code>
                <span class="type"><a href="language.types.string.php" class="type string">string</a></span>
            </dt>

            <dd>

    <span class="simpara">
     The name of the key to be used in <var class="varname"><var class="varname"><a href="reserved.variables.session.php" class="classname">$_SESSION</a></var></var> storing
     the progress information. See also
     <a href="session.configuration.php#ini.session.upload-progress.prefix" class="link">session.upload_progress.prefix</a>.
    </span>
                <span class="simpara">
     If <em>$_POST[ini_get(&quot;session.upload_progress.name&quot;)]</em>
     is not passed or available, upload progressing will not be recorded.
    </span>
                <span class="simpara">
     Defaults to &quot;PHP_SESSION_UPLOAD_PROGRESS&quot;.
    </span>
            </dd>




            <dt id="ini.session.upload-progress.freq">
                <code class="parameter">session.upload_progress.freq</code>
                <span class="type"><a href="language.pseudo-types.php#language.types.mixed" class="type mixed">mixed</a></span>
            </dt>

            <dd>

    <span class="simpara">
     Defines how often the upload progress information should be updated.
     This can be defined in bytes (i.e. &quot;update progress information after every 100 bytes&quot;), or in percentages (i.e. &quot;update progress information after receiving every 1% of the whole filesize&quot;).
    </span>
                <span class="simpara">
     Defaults to &quot;1%&quot;.
    </span>
            </dd>




            <dt id="ini.session.upload-progress.min-freq">
                <code class="parameter">session.upload_progress.min_freq</code>
                <span class="type"><a href="language.types.integer.php" class="type integer">integer</a></span>
            </dt>

            <dd>

    <span class="simpara">
     The minimum delay between updates, in seconds.
     Defaults to &quot;1&quot; (one second).
    </span>
            </dd>




            <dt id="ini.session.lazy-write">
                <code class="parameter">session.lazy_write</code>
                <span class="type"><a href="language.types.boolean.php" class="type boolean">boolean</a></span>
            </dt>

            <dd>

    <span class="simpara">
     <em>session.lazy_write</em>, when set to 1, means that session
     data is only rewritten if it changes. Defaults to 1, enabled.
    </span>
            </dd>



            </dl>

            </p>

            <p class="para">
                The
                <a href="ini.core.php#ini.register-globals" class="link"><em>register_globals</em></a>
                configuration settings influence how the session variables get
                stored and restored.
            </p>

            <p class="para">
                Upload progress will not be registered unless
                session.upload_progress.enabled is enabled, and the
                $_POST[ini_get(&quot;session.upload_progress.name&quot;)] variable is set.
                See <a href="session.upload-progress.php" class="link">Session Upload Progress</a> for more details on this functionality.
            </p>

        </div>
</body>

</html>

