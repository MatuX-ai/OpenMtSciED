Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "G:\Python312\Lib\site-packages\markitdown\__main__.py", line 223, in <module>
    main()
  File "G:\Python312\Lib\site-packages\markitdown\__main__.py", line 196, in main
    result = markitdown.convert(
             ^^^^^^^^^^^^^^^^^^^
  File "G:\Python312\Lib\site-packages\markitdown\_markitdown.py", line 283, in convert
    return self.convert_local(source, stream_info=stream_info, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "G:\Python312\Lib\site-packages\markitdown\_markitdown.py", line 333, in convert_local
    with open(path, "rb") as fh:
         ^^^^^^^^^^^^^^^^
OSError: [Errno 22] Invalid argument: '"g:/iMato/scripts/MatuX_创业大赛商业计划书_完整版.pptx"'
